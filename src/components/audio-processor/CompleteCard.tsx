import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FileAnalysis, ProcessingStep } from './types';

interface CompleteCardProps {
  currentStep: ProcessingStep;
  fileAnalysis: FileAnalysis | null;
  onDownloadResult: () => void;
  onResetProcess: () => void;
}

export default function CompleteCard({
  currentStep,
  fileAnalysis,
  onDownloadResult,
  onResetProcess
}: CompleteCardProps) {
  if (currentStep !== 'complete' || !fileAnalysis) {
    return null;
  }

  return (
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
            onClick={onDownloadResult}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            <Icon name="Download" size={20} className="mr-2" />
            Скачать MP3 архив
          </Button>
          
          <Button 
            onClick={onResetProcess}
            variant="outline"
            className="w-full"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Обработать новый архив
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}