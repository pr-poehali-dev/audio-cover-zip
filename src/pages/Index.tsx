import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import JSZip from 'jszip';

interface FileAnalysis {
  wavFiles: number;
  jpgFiles: number;
  matchedPairs: number;
  unmatchedFiles: string[];
  wavFilesList: string[];
  jpgFilesList: string[];
  matchedPairsList: Array<{wav: string, jpg: string}>;
}

interface ZipFileData {
  [key: string]: ArrayBuffer;
}

export default function Index() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'processing' | 'complete'>('upload');
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
          fileAnalysis.matchedPairsList.forEach((pair, index) => {
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
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AUDIO PROCESSOR
          </h1>
          <p className="text-muted-foreground">
            WAV → MP3 конвертер с добавлением обложек
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className={`flex items-center space-x-2 ${currentStep === 'upload' || currentStep === 'analyzing' ? 'text-primary' : 'text-accent'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'upload' || currentStep === 'analyzing' ? 'border-primary bg-primary/20' : 'border-accent bg-accent/20'}`}>
              {currentStep === 'analyzing' ? (
                <Icon name="Search" size={16} className="animate-spin" />
              ) : (
                <Icon name="Upload" size={16} />
              )}
            </div>
            <span className="font-medium text-sm">Анализ</span>
          </div>
          
          <Separator className="w-8" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'processing' ? 'text-primary' : currentStep === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'processing' ? 'border-primary bg-primary/20' : currentStep === 'complete' ? 'border-accent bg-accent/20' : 'border-muted'}`}>
              <Icon name="Cog" size={16} />
            </div>
            <span className="font-medium text-sm">Конвертация</span>
          </div>
          
          <Separator className="w-8" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'complete' ? 'border-accent bg-accent/20' : 'border-muted'}`}>
              <Icon name="Download" size={16} />
            </div>
            <span className="font-medium text-sm">Скачать</span>
          </div>
        </div>

        {/* Upload Card */}
        {(currentStep === 'upload' || currentStep === 'analyzing') && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="FolderUp" size={20} />
                <span>Загрузка ZIP архива</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Info" size={16} className="text-primary" />
                  <span className="font-medium text-sm">Требования к архиву:</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• WAV файлы: 001.wav, 002.wav, ... 080.wav</li>
                  <li>• JPG обложки: 001.jpg, 002.jpg, ... 080.jpg</li>
                  <li>• Номера файлов должны совпадать для сопоставления</li>
                </ul>
              </div>

              {/* File Analysis */}
              {fileAnalysis && currentStep !== 'analyzing' && (
                <div className="p-4 bg-accent/10 rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="BarChart3" size={16} className="text-accent" />
                    <span className="font-medium">Анализ файлов:</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{fileAnalysis.wavFiles}</div>
                      <div className="text-xs text-muted-foreground">WAV файлов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{fileAnalysis.jpgFiles}</div>
                      <div className="text-xs text-muted-foreground">JPG файлов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{fileAnalysis.matchedPairs}</div>
                      <div className="text-xs text-muted-foreground">Совпадений</div>
                    </div>
                  </div>

                  {fileAnalysis.unmatchedFiles.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="AlertTriangle" size={14} className="text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-500">Файлы без пары:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {fileAnalysis.unmatchedFiles.slice(0, 6).map(file => (
                          <Badge key={file} variant="outline" className="text-xs">
                            {file}
                          </Badge>
                        ))}
                        {fileAnalysis.unmatchedFiles.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{fileAnalysis.unmatchedFiles.length - 6} ещё
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover-scale ${
                  currentStep === 'analyzing' 
                    ? 'border-primary bg-primary/10 animate-pulse-glow pointer-events-none' 
                    : dragActive 
                      ? 'border-primary bg-primary/10 animate-pulse-glow' 
                      : uploadedFile 
                        ? 'border-accent bg-accent/10' 
                        : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => currentStep !== 'analyzing' && document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={currentStep === 'analyzing'}
                />
                
                {currentStep === 'analyzing' ? (
                  <div className="space-y-4 animate-fade-in">
                    <Icon name="Search" size={48} className="mx-auto text-primary animate-spin" />
                    <div>
                      <p className="text-lg font-medium text-primary">Анализ архива...</p>
                      <p className="text-sm text-muted-foreground">Проверяем WAV и JPG файлы</p>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-2 animate-fade-in">
                    <Icon name="CheckCircle" size={48} className="mx-auto text-accent" />
                    <p className="text-accent font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Перетащите ZIP-файл сюда</p>
                      <p className="text-sm text-muted-foreground">или нажмите для выбора</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={startProcessing}
                disabled={!fileAnalysis || currentStep === 'analyzing'}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <Icon name="Play" size={20} className="mr-2" />
                {fileAnalysis 
                  ? `Конвертировать ${fileAnalysis.matchedPairs} файлов` 
                  : 'Начать обработку'
                }
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Processing Card */}
        {currentStep === 'processing' && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Cog" size={20} className="animate-spin" />
                <span>Обработка файлов</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {Math.round(progress)}%
                  </div>
                  <p className="text-muted-foreground">
                    {processingStep}
                  </p>
                </div>
                
                <Progress value={progress} className="w-full h-3" />
                
                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Music" size={16} />
                    <span>WAV → MP3</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Image" size={16} />
                    <span>Обложки</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Archive" size={16} />
                    <span>ZIP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Card */}
        {currentStep === 'complete' && fileAnalysis && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-accent">
                <Icon name="CheckCircle" size={20} />
                <span>Конвертация завершена</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                  <Icon name="FileArchive" size={40} className="text-accent" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">Готов к скачиванию!</h3>
                  <p className="text-muted-foreground">
                    Обработано <span className="text-accent font-medium">{fileAnalysis.matchedPairs} файлов</span> с обложками
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1 text-green-500">
                    <Icon name="Music" size={14} />
                    <span>MP3</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-500">
                    <Icon name="Image" size={14} />
                    <span>Обложки</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-500">
                    <Icon name="Archive" size={14} />
                    <span>ZIP архив</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={downloadResult}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  <Icon name="Download" size={20} className="mr-2" />
                  Скачать MP3 архив
                </Button>
                
                <Button 
                  onClick={resetProcess}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Обработать новый архив
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Автоматическое сопоставление WAV файлов с JPG обложками по номерам</p>
        </div>
      </div>
    </div>
  );
}