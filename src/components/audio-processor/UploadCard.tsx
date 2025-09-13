import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FileAnalysis, ProcessingStep } from './types';

interface UploadCardProps {
  currentStep: ProcessingStep;
  dragActive: boolean;
  uploadedFile: File | null;
  fileAnalysis: FileAnalysis | null;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartProcessing: () => void;
}

export default function UploadCard({
  currentStep,
  dragActive,
  uploadedFile,
  fileAnalysis,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  onStartProcessing
}: UploadCardProps) {
  if (currentStep !== 'upload' && currentStep !== 'analyzing') {
    return null;
  }

  return (
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
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => currentStep !== 'analyzing' && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".zip"
            onChange={onFileSelect}
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
          onClick={onStartProcessing}
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
  );
}