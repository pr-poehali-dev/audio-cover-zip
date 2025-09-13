import React from 'react';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ProcessingStep } from './types';

interface AudioProcessorHeaderProps {
  currentStep: ProcessingStep;
}

export default function AudioProcessorHeader({ currentStep }: AudioProcessorHeaderProps) {
  return (
    <>
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
    </>
  );
}