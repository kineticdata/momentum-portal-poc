import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Icon } from '../../atoms/Icon.jsx';
import { RiskBadge } from './RiskBadge.jsx';

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const daysSince = (dateString) => {
  if (!dateString) return 0;
  const created = new Date(dateString);
  const now = new Date();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
};

const STAGE_COLORS = {
  'Application Intake': 'bg-info/15 text-info border-info/30',
  'Pre-Screening': 'bg-primary/15 text-primary border-primary/30',
  'Document Collection': 'bg-secondary/15 text-secondary border-secondary/30',
  'Document Verification': 'bg-accent/15 text-accent border-accent/30',
  'Fraud Check': 'bg-warning/15 text-warning border-warning/30',
  'Credit Assessment': 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  'Approval': 'bg-success/15 text-success border-success/30',
  'Disbursement': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  'Active': 'bg-success/15 text-success border-success/30',
  'Declined': 'bg-error/15 text-error border-error/30',
};

export const LoanCard = ({ submission }) => {
  const { values = {}, id, createdAt } = submission || {};
  const borrowerName = values['Borrower Name'] || values['Full Name'] || 'Unknown Borrower';
  const loanAmount = values['Loan Amount'] || values['Amount'] || '0';
  const loanType = values['Loan Type'] || values['Type'] || 'Commercial';
  const stage = values['Stage'] || values['Status'] || 'Application Intake';
  const riskLevel = values['Risk Level'] || values['Risk'] || 'Medium';
  const days = daysSince(createdAt);

  const stageClasses = STAGE_COLORS[stage] || 'bg-base-200 text-base-content/70 border-base-300';

  return (
    <div
      className={clsx(
        'kcard bg-base-100 border border-base-200',
        'shadow-sm hover:shadow-lg transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/20',
        'group relative',
      )}
    >
      <div className="kcard-body p-4 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/applications/${id}`}
              className={clsx(
                'text-sm font-semibold text-base-content leading-tight',
                'hover:text-primary transition-colors duration-200',
                'line-clamp-1 after:absolute after:inset-0',
              )}
            >
              {borrowerName}
            </Link>
            <p className="text-xs text-base-content/50 mt-0.5">{loanType}</p>
          </div>
          <RiskBadge level={riskLevel} />
        </div>

        {/* Amount */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-base-content">
            {formatCurrency(loanAmount)}
          </span>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-base-200">
          <span
            className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full',
              'text-[11px] font-semibold border',
              stageClasses,
            )}
          >
            {stage}
          </span>
          <div className="flex items-center gap-1 text-xs text-base-content/40">
            <Icon name="clock" size={14} />
            <span>{days}d ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
