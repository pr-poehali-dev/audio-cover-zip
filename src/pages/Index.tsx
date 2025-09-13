import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface FilePattern {
  prefix: string;
  numbering: string;
  extension: string;
}

export default function Index() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePattern, setFilePattern] = useState<FilePattern>({
    prefix: 'audio',
    numbering: '001',
    extension: 'wav'
  });

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
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  };

  const startProcessing = () => {
    setCurrentStep('processing');
    // Симуляция процесса
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setCurrentStep('complete');
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setProgress(0);
    setUploadedFile(null);
  };

  const downloadResult = () => {
    // Симуляция скачивания
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'processed_audio.zip';
    link.click();
  };

  const getPatternPreview = () => {
    return `${filePattern.prefix}_${filePattern.numbering}.${filePattern.extension}`;
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
            Загрузите ZIP-архив с аудиофайлами для обработки
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-primary' : currentStep !== 'upload' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'upload' ? 'border-primary bg-primary/20' : currentStep !== 'upload' ? 'border-accent bg-accent/20' : 'border-muted'}`}>
              <Icon name="Upload" size={16} />
            </div>
            <span className="font-medium">Загрузка</span>
          </div>
          
          <Separator className="w-12" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'processing' ? 'text-primary' : currentStep === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'processing' ? 'border-primary bg-primary/20' : currentStep === 'complete' ? 'border-accent bg-accent/20' : 'border-muted'}`}>
              <Icon name="Cog" size={16} />
            </div>
            <span className="font-medium">Обработка</span>
          </div>
          
          <Separator className="w-12" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'complete' ? 'border-accent bg-accent/20' : 'border-muted'}`}>
              <Icon name="Download" size={16} />
            </div>
            <span className="font-medium">Готово</span>
          </div>
        </div>

        {/* Upload Card */}
        {currentStep === 'upload' && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="FolderUp" size={20} />
                <span>Загрузка файлов</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Pattern Settings */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium">Паттерн названий файлов</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="prefix" className="text-xs text-muted-foreground">Префикс</Label>
                    <Input
                      id="prefix"
                      value={filePattern.prefix}
                      onChange={(e) => setFilePattern(prev => ({ ...prev, prefix: e.target.value }))}
                      placeholder="audio"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numbering" className="text-xs text-muted-foreground">Нумерация</Label>
                    <Input
                      id="numbering"
                      value={filePattern.numbering}
                      onChange={(e) => setFilePattern(prev => ({ ...prev, numbering: e.target.value }))}
                      placeholder="001"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="extension" className="text-xs text-muted-foreground">Формат</Label>
                    <Input
                      id="extension"
                      value={filePattern.extension}
                      onChange={(e) => setFilePattern(prev => ({ ...prev, extension: e.target.value }))}
                      placeholder="wav"
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Пример: <span className="text-primary font-mono">{getPatternPreview()}</span>
                </div>
              </div>

              {/* File Upload */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover-scale ${
                  dragActive 
                    ? 'border-primary bg-primary/10 animate-pulse-glow' 
                    : uploadedFile 
                      ? 'border-accent bg-accent/10' 
                      : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {uploadedFile ? (
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
                disabled={!uploadedFile}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <Icon name="Play" size={20} className="mr-2" />
                Начать обработку
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
                    Конвертация аудиофайлов...
                  </p>
                </div>
                
                <Progress value={progress} className="w-full h-3" />
                
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Music" size={16} />
                    <span>Обработано: {Math.round(progress / 10)} файлов</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Card */}
        {currentStep === 'complete' && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-accent">
                <Icon name="CheckCircle" size={20} />
                <span>Обработка завершена</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                  <Icon name="FileArchive" size={40} className="text-accent" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">Все готово!</h3>
                  <p className="text-muted-foreground">
                    Файлы обработаны по паттерну: <span className="text-primary font-mono">{getPatternPreview()}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={downloadResult}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  <Icon name="Download" size={20} className="mr-2" />
                  Скачать результат
                </Button>
                
                <Button 
                  onClick={resetProcess}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Обработать ещё файлы
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: WAV, MP3, FLAC, OGG, M4A</p>
        </div>
      </div>
    </div>
  );
}