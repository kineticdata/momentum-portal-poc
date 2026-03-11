import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const RISK_CONFIG = {
  Low: {
    classes: 'bg-success/15 text-success border-success/30',
    icon: 'shield-check',
    glow: 'shadow-success/10',
  },
  Medium: {
    classes: 'bg-warning/15 text-warning border-warning/30',
    icon: 'alert-triangle',
    glow: 'shadow-warning/10',
  },
  High: {
    classes: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    icon: 'alert-octagon',
    glow: 'shadow-orange-500/10',
  },
  Critical: {
    classes: 'bg-error/15 text-error border-error/30',
    icon: 'urgent',
    glow: 'shadow-error/10',
  },
};

export const RiskBadge = ({ level }) => {
  const config = RISK_CONFIG[level] || RISK_CONFIG.Medium;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-semibold border',
        'shadow-sm transition-all duration-200',
        config.classes,
        config.glow,
      )}
    >
      <Icon name={config.icon} size={14} />
      {level} Risk
    </span>
  );
};
