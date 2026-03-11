import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const TYPE_CONFIG = {
  submission: {
    icon: 'file-text',
    color: 'bg-primary/15 text-primary border-primary/30',
    line: 'border-primary/20',
  },
  approval: {
    icon: 'circle-check',
    color: 'bg-success/15 text-success border-success/30',
    line: 'border-success/20',
  },
  review: {
    icon: 'eye',
    color: 'bg-info/15 text-info border-info/30',
    line: 'border-info/20',
  },
  task: {
    icon: 'list-check',
    color: 'bg-warning/15 text-warning border-warning/30',
    line: 'border-warning/20',
  },
  system: {
    icon: 'settings-automation',
    color: 'bg-base-300 text-base-content/60 border-base-content/10',
    line: 'border-base-300',
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const AuditTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <Icon name="history" size={40} />
        <p className="mt-2 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Main vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-base-300 to-transparent" />

      <div className="flex flex-col gap-6">
        {activities.map((activity, index) => {
          const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.system;
          const isFirst = index === 0;

          return (
            <div key={index} className="relative group">
              {/* Timeline node */}
              <div
                className={clsx(
                  'absolute -left-8 top-0.5 w-8 h-8 rounded-full',
                  'flex items-center justify-center border',
                  'transition-all duration-300',
                  'group-hover:scale-110 group-hover:shadow-md',
                  config.color,
                  { 'ring-2 ring-primary/20 shadow-md': isFirst },
                )}
              >
                <Icon name={config.icon} size={16} />
              </div>

              {/* Content */}
              <div
                className={clsx(
                  'ml-4 pb-1',
                  'transition-all duration-200',
                  'group-hover:translate-x-0.5',
                )}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className={clsx(
                      'text-sm font-semibold text-base-content',
                      { 'text-primary': isFirst },
                    )}
                  >
                    {activity.title}
                  </h4>
                  <span className="text-[11px] text-base-content/40 font-medium">
                    {formatDate(activity.date)}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-sm text-base-content/60 mt-0.5 leading-relaxed">
                    {activity.description}
                  </p>
                )}
                {activity.user && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Icon name="user" size={12} className="text-base-content/30" />
                    <span className="text-xs text-base-content/40 font-medium">
                      {activity.user}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
