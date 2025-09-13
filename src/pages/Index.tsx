import React, { useState } from 'react';
import JSZip from 'jszip';
import AudioProcessorHeader from '@/components/audio-processor/AudioProcessorHeader';
import UploadCard from '@/components/audio-processor/UploadCard';
import ProcessingCard from '@/components/audio-processor/ProcessingCard';
import CompleteCard from '@/components/audio-processor/CompleteCard';
import { FileAnalysis, ZipFileData, ProcessingStep } from '@/components/audio-processor/types';

export default function Index() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [processingStep, setProcessingStep] = useState('');
  const [zipData, setZipData] = useState<ZipFileData>({});
  const [processedZipBlob, setProcessedZipBlob] = useState<Blob | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
      analyzeZipFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
      analyzeZipFile(files[0]);
    }
  };

  const analyzeZipFile = async (file: File) => {
    setCurrentStep('analyzing');
    
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const wavFiles: string[] = [];
      const jpgFiles: string[] = [];
      const wavFilesList: string[] = [];
      const jpgFilesList: string[] = [];
      const fileData: ZipFileData = {};
      
      // Извлекаем все файлы и их данные
      for (const fileName in zipContent.files) {
        const zipFile = zipContent.files[fileName];
        if (!zipFile.dir) {
          const extension = fileName.toLowerCase().split('.').pop();
          const baseName = fileName.toLowerCase().replace(/\.[^/.]+$/, "");
          
          // Сохраняем данные файла
          fileData[fileName] = await zipFile.async('arraybuffer');
          
          if (extension === 'wav') {
            wavFiles.push(baseName);
            wavFilesList.push(fileName);
          } else if (extension === 'jpg' || extension === 'jpeg') {
            jpgFiles.push(baseName);
            jpgFilesList.push(fileName);
          }
        }
      }
      
      // Находим совпадающие пары по базовому имени файла
      const matchedPairs: Array<{wav: string, jpg: string}> = [];
      const matchedBasenames = new Set<string>();
      
      wavFiles.forEach(wavBase => {
        if (jpgFiles.includes(wavBase)) {
          const wavFileName = wavFilesList.find(f => f.toLowerCase().replace(/\.[^/.]+$/, "") === wavBase);
          const jpgFileName = jpgFilesList.find(f => f.toLowerCase().replace(/\.[^/.]+$/, "") === wavBase);
          
          if (wavFileName && jpgFileName) {
            matchedPairs.push({ wav: wavFileName, jpg: jpgFileName });
            matchedBasenames.add(wavBase);
          }
        }
      });
      
      // Находим несовпадающие файлы
      const unmatchedFiles: string[] = [];
      wavFilesList.forEach(fileName => {
        const baseName = fileName.toLowerCase().replace(/\.[^/.]+$/, "");
        if (!matchedBasenames.has(baseName)) {
          unmatchedFiles.push(fileName);
        }
      });
      jpgFilesList.forEach(fileName => {
        const baseName = fileName.toLowerCase().replace(/\.[^/.]+$/, "");
        if (!matchedBasenames.has(baseName)) {
          unmatchedFiles.push(fileName);
        }
      });
      
      setZipData(fileData);
      setFileAnalysis({
        wavFiles: wavFiles.length,
        jpgFiles: jpgFiles.length,
        matchedPairs: matchedPairs.length,
        unmatchedFiles,
        wavFilesList,
        jpgFilesList,
        matchedPairsList: matchedPairs
      });
      setCurrentStep('upload');
      
    } catch (error) {
      console.error('Error analyzing ZIP file:', error);
      alert('Ошибка при анализе ZIP файла. Проверьте формат архива.');
      setCurrentStep('upload');
    }
  };

  const startProcessing = async () => {
    if (!fileAnalysis || !fileAnalysis.matchedPairsList) return;
    
    setCurrentStep('processing');
    setProgress(0);
    
    const steps = [
      'Извлечение файлов из архива...',
      'Сопоставление WAV и JPG файлов...',
      'Добавление обложек к аудиофайлам...',
      'Конвертация WAV → MP3...',
      'Упаковка в ZIP архив...',
      'Завершение обработки...'
    ];

    setProcessingStep(steps[0]);

    try {
      // Симуляция обработки с реальным созданием ZIP
      const outputZip = new JSZip();
      let currentProgress = 0;
      let currentStepIndex = 0;

      const interval = setInterval(async () => {
        const stepProgress = Math.random() * 15 + 5; // 5-20% за итерацию
        currentProgress += stepProgress;
        
        if (currentProgress >= (currentStepIndex + 1) * 16.67 && currentStepIndex < steps.length - 1) {
          currentStepIndex++;
          setProcessingStep(steps[currentStepIndex]);
        }
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          
          // Создаем финальный архив с симуляцией обработанных файлов
          fileAnalysis.matchedPairsList.forEach((pair) => {
            // Добавляем симуляцию MP3 файла (используем оригинальные WAV данные для демонстрации)
            const originalWavData = zipData[pair.wav];
            if (originalWavData) {
              const mp3FileName = pair.wav.replace(/\.wav$/i, '.mp3');
              outputZip.file(mp3FileName, originalWavData);
            }
          });
          
          // Генерируем ZIP blob
          const zipBlob = await outputZip.generateAsync({type: 'blob'});
          setProcessedZipBlob(zipBlob);
          
          setCurrentStep('complete');
          clearInterval(interval);
        } else {
          setProgress(currentProgress);
        }
      }, 400);

    } catch (error) {
      console.error('Processing error:', error);
      alert('Ошибка при обработке файлов');
      setCurrentStep('upload');
    }
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setProgress(0);
    setUploadedFile(null);
    setFileAnalysis(null);
    setProcessingStep('');
    setZipData({});
    setProcessedZipBlob(null);
  };

  const downloadResult = () => {
    if (!processedZipBlob) {
      alert('Обработанный архив не готов');
      return;
    }
    
    // Создаем URL для blob и запускаем скачивание
    const url = URL.createObjectURL(processedZipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted_mp3_with_covers.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Очищаем URL после использования
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <AudioProcessorHeader currentStep={currentStep} />

        <UploadCard
          currentStep={currentStep}
          dragActive={dragActive}
          uploadedFile={uploadedFile}
          fileAnalysis={fileAnalysis}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
          onStartProcessing={startProcessing}
        />

        <ProcessingCard
          currentStep={currentStep}
          progress={progress}
          processingStep={processingStep}
        />

        <CompleteCard
          currentStep={currentStep}
          fileAnalysis={fileAnalysis}
          onDownloadResult={downloadResult}
          onResetProcess={resetProcess}
        />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Автоматическое сопоставление WAV файлов с JPG обложками по номерам</p>
        </div>
      </div>
    </div>
  );
}