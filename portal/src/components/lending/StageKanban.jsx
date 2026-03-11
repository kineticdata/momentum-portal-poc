import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';
import { LoanCard } from './LoanCard.jsx';

const COLUMN_ACCENTS = {
  'Application Intake': 'from-info to-info/60',
  'Pre-Screening': 'from-primary to-primary/60',
  'Document Collection': 'from-secondary to-secondary/60',
  'Document Verification': 'from-accent to-accent/60',
  'Fraud Check': 'from-warning to-warning/60',
  'Credit Assessment': 'from-orange-500 to-orange-400',
  'Approval': 'from-success to-emerald-500',
  'Disbursement': 'from-emerald-500 to-teal-500',
  'Active': 'from-success to-success/60',
  'Declined': 'from-error to-red-600',
};

export const StageKanban = ({ submissions = [], stages = [] }) => {
  // Group submissions by stage
  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = submissions.filter(
      (s) => (s.values?.['Stage'] || s.values?.['Status']) === stage,
    );
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {stages.map((stage) => {
        const items = grouped[stage] || [];
        const accent = COLUMN_ACCENTS[stage] || 'from-base-300 to-base-300/60';

        return (
          <div
            key={stage}
            className={clsx(
              'flex-none w-72 flex flex-col',
              'bg-base-200/40 rounded-xl border border-base-200',
              'overflow-hidden',
            )}
          >
            {/* Column header */}
            <div className="p-3 flex-none">
              <div
                className={clsx(
                  'h-1 w-full rounded-full mb-3',
                  'bg-gradient-to-r',
                  accent,
                )}
              />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-base-content truncate">
                  {stage}
                </h3>
                <span
                  className={clsx(
                    'flex-none inline-flex items-center justify-center',
                    'w-6 h-6 rounded-full text-xs font-bold',
                    'bg-base-300 text-base-content/70',
                  )}
                >
                  {items.length}
                </span>
              </div>
            </div>

            {/* Scrollable card list */}
            <div className="flex-1 overflow-y-auto p-2 pt-0 flex flex-col gap-2">
              {items.length > 0 ? (
                items.map((submission) => (
                  <LoanCard key={submission.id} submission={submission} />
                ))
              ) : (
                <div
                  className={clsx(
                    'flex flex-col items-center justify-center py-8',
                    'text-base-content/25',
                  )}
                >
                  <Icon name="inbox" size={28} />
                  <p className="text-xs mt-1">No items</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
