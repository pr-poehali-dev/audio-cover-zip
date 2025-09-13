import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { ProcessingStep } from './types';

interface ProcessingCardProps {
  currentStep: ProcessingStep;
  progress: number;
  processingStep: string;
}

export default function ProcessingCard({
  currentStep,
  progress,
  processingStep
}: ProcessingCardProps) {
  if (currentStep !== 'processing') {
    return null;
  }

  return (
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
  );
}