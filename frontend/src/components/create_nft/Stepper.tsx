import React, { Children, useState, ReactNode } from 'react';
import { Check } from "lucide-react";

interface StepperProps {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: ReactNode;
  nextButtonText?: ReactNode;
  finishButtonText?: ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  finishButtonText = 'Finish',
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (isLastStep) {
      onFinalStepCompleted();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange(prevStep);
    }
  };

  return (
    <div className={`w-full ${stepContainerClassName}`}>
      {/* Step Indicators */}
      <div className={`flex items-center justify-between ${stepCircleContainerClassName}`}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`relative flex items-center justify-center w-8 h-8 font-bold border transition-all duration-300 ${
                  isActive
                    ? "bg-signal text-background border-signal scale-110"
                    : isCompleted
                    ? "bg-surface-2 text-ink border-signal"
                    : "bg-background text-ink-40 border-ink-08"
                }`}
              >
                {isCompleted ? (
                   <Check className="w-4 h-4" /> 
                ) : (
                  <span className="text-sm font-mono">{stepNumber}</span>
                )}
              </div>
              
              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <div
                  className={`h-px w-12 sm:w-24 mx-2 transition-all duration-300 ${
                    stepNumber < currentStep ? "bg-signal" : "bg-ink-08"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className={`mb-8 min-h-[300px] animate-in fade-in slide-in-from-bottom-2 duration-500 ${contentClassName}`}>
        {stepsArray[currentStep - 1]}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-ink-08">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || backButtonProps.disabled}
          className={`${backButtonProps.className} ${
            currentStep === 1 ? "invisible" : ""
          }`}
        >
          {backButtonText}
        </button>

        <button
          onClick={handleNext}
          disabled={nextButtonProps.disabled}
          className={nextButtonProps.className}
        >
          {isLastStep ? finishButtonText : nextButtonText}
        </button>
      </div>
    </div>
  );
}
