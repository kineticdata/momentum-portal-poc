import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const DEFAULT_STAGES = [
  'Application Intake',
  'Pre-Screening',
  'Document Collection',
  'Document Verification',
  'Fraud Check',
  'Credit Assessment',
  'Approval',
  'Disbursement',
  'Active',
  'Declined',
];

export const StagePipeline = ({
  currentStage,
  stages = DEFAULT_STAGES,
}) => {
  const currentIndex = stages.indexOf(currentStage);
  const isDeclined = currentStage === 'Declined';

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center justify-between min-w-[720px] px-2">
        {stages.map((stage, index) => {
          const isCompleted = !isDeclined && currentIndex > index && stage !== 'Declined';
          const isCurrent = stage === currentStage;
          const isDeclinedStage = stage === 'Declined';
          const isFuture = !isCompleted && !isCurrent;
          const isLast = index === stages.length - 1;

          return (
            <div
              key={stage}
              className={clsx('flex items-center', { 'flex-1': !isLast })}
            >
              {/* Stage node */}
              <div className="flex flex-col items-center gap-2 relative group">
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'transition-all duration-500 ease-out',
                    'border-2 shadow-sm',
                    {
                      // Completed
                      'bg-gradient-to-br from-success to-emerald-600 border-success text-success-content shadow-success/30 shadow-md':
                        isCompleted,
                      // Current (not declined)
                      'bg-gradient-to-br from-primary to-primary/80 border-primary text-primary-content shadow-primary/40 shadow-lg scale-110 ring-4 ring-primary/20':
                        isCurrent && !isDeclinedStage,
                      // Current declined
                      'bg-gradient-to-br from-error to-red-700 border-error text-error-content shadow-error/40 shadow-lg scale-110 ring-4 ring-error/20':
                        isCurrent && isDeclinedStage,
                      // Declined stage (not current)
                      'border-error/30 bg-error/5 text-error/40':
                        isDeclinedStage && !isCurrent,
                      // Future
                      'border-base-300 bg-base-200 text-base-content/30':
                        isFuture && !isDeclinedStage,
                    },
                  )}
                >
                  {isCompleted ? (
                    <Icon name="check" size={20} />
                  ) : isDeclinedStage ? (
                    <Icon name="x" size={20} />
                  ) : isCurrent ? (
                    <Icon name="loader-2" size={20} className="animate-spin-slow" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={clsx(
                    'text-[11px] font-medium text-center leading-tight max-w-[80px]',
                    'transition-colors duration-300',
                    {
                      'text-success font-semibold': isCompleted,
                      'text-primary font-bold': isCurrent && !isDeclinedStage,
                      'text-error font-bold': isCurrent && isDeclinedStage,
                      'text-error/40': isDeclinedStage && !isCurrent,
                      'text-base-content/40': isFuture && !isDeclinedStage,
                    },
                  )}
                >
                  {stage}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1 h-0.5 relative self-start mt-5">
                  <div className="absolute inset-0 bg-base-300 rounded-full" />
                  <div
                    className={clsx(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
                      {
                        'w-full bg-gradient-to-r from-success to-success':
                          isCompleted,
                        'w-1/2 bg-gradient-to-r from-success to-primary':
                          isCurrent && !isDeclinedStage && currentIndex === index,
                        'w-0': isFuture || (isDeclinedStage && !isCurrent),
                      },
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
