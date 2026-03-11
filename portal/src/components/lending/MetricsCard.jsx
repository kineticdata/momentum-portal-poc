import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const COLOR_MAP = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'bg-gradient-to-br from-primary to-primary/70 text-primary-content shadow-primary/25',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'bg-gradient-to-br from-success to-emerald-600 text-success-content shadow-success/25',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'bg-gradient-to-br from-warning to-amber-600 text-warning-content shadow-warning/25',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    icon: 'bg-gradient-to-br from-error to-red-700 text-error-content shadow-error/25',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'bg-gradient-to-br from-info to-sky-600 text-info-content shadow-info/25',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: 'bg-gradient-to-br from-accent to-blue-700 text-accent-content shadow-accent/25',
  },
};

export const MetricsCard = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div
      className={clsx(
        'kcard bg-base-100 border border-base-200',
        'shadow-sm hover:shadow-md transition-all duration-300',
        'hover:-translate-y-0.5',
      )}
    >
      <div className="kcard-body p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium uppercase tracking-wider text-base-content/50">
              {title}
            </span>
            <span className="text-3xl font-bold tracking-tight text-base-content">
              {value}
            </span>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <Icon
                  name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
                  size={16}
                  className={clsx({
                    'text-success': trend.direction === 'up',
                    'text-error': trend.direction === 'down',
                  })}
                />
                <span
                  className={clsx('text-xs font-semibold', {
                    'text-success': trend.direction === 'up',
                    'text-error': trend.direction === 'down',
                  })}
                >
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          <div
            className={clsx(
              'flex-none w-12 h-12 rounded-xl flex items-center justify-center',
              'shadow-lg',
              colors.icon,
            )}
          >
            <Icon name={icon} size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
