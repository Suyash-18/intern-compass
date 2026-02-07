import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: 1 | 2 | 3;
  steps: { label: string; description: string }[];
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'progress-step',
                    isCompleted && 'progress-step-completed',
                    isCurrent && 'progress-step-active',
                    !isCompleted && !isCurrent && 'progress-step-inactive'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'progress-line flex-1 mx-4 mt-[-40px]',
                    stepNumber < currentStep
                      ? 'progress-line-active'
                      : 'progress-line-inactive'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
