import React, { useState, Children, useRef, useLayoutEffect, HTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
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
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  finishButtonText = 'Finish',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onFinalStepCompleted();
      return;
    }
    setDirection(1);
    updateStep(currentStep + 1);
  };

  return (
    <div className={`flex flex-col w-full h-full ${stepContainerClassName}`} {...rest}>
      {!disableStepIndicators && (
        <div className={`flex items-center justify-center mb-8 ${stepCircleContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const step = index + 1;
            const isCompletedStep = step < currentStep || isCompleted;
            const isCurrentStep = step === currentStep && !isCompleted;

            return (
              <React.Fragment key={step}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step,
                    currentStep,
                    onStepClick: (clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={step}
                    isCompleted={isCompletedStep}
                    isCurrent={isCurrentStep}
                    onClick={() => {
                      setDirection(step > currentStep ? 1 : -1);
                      updateStep(step);
                    }}
                  />
                )}
                {index < stepsArray.length - 1 && (
                  <StepConnector isComplete={isCompletedStep} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className={`flex-1 overflow-hidden relative p-1 ${contentClassName}`}>
        <AnimatePresence mode="popLayout" custom={direction}>
          {!isCompleted && (
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial={direction >= 0 ? 'enterRight' : 'enterLeft'}
              animate="center"
              exit={direction >= 0 ? 'exitLeft' : 'exitRight'}
              custom={direction}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {stepsArray[currentStep - 1]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isCompleted && (
        <div className={`flex justify-between mt-4 ${footerClassName}`}>
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            {...backButtonProps}
          >
            {backButtonText}
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            {...nextButtonProps}
          >
            {isLastStep ? finishButtonText : nextButtonText}
          </button>
        </div>
      )}
    </div>
  );
}

const stepVariants: Variants = {
  enterRight: { x: '100%', opacity: 0 },
  enterLeft: { x: '-100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitLeft: { x: '-100%', opacity: 0 },
  exitRight: { x: '100%', opacity: 0 },
};

interface StepIndicatorProps {
  step: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

function StepIndicator({ step, isCompleted, isCurrent, onClick }: StepIndicatorProps) {
  const status = isCompleted ? 'complete' : isCurrent ? 'active' : 'inactive';

  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer outline-none focus:outline-none"
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#222', color: '#a3a3a3' },
          active: { scale: 1, backgroundColor: '#10b981', color: '#10b981' },
          complete: { scale: 1, backgroundColor: '#10b981', color: '#84cc16' }
        }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 items-center justify-center rounded-full font-semibold"
      >
        {status === 'complete' ? (
          <CheckIcon className="h-4 w-4 text-black" />
        ) : status === 'active' ? (
          <div className="h-3 w-3 rounded-full bg-[#060010]" />
        ) : (
          <span className="text-sm">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#10b981' }
  };

  return (
    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-neutral-600">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
