import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const STATUS_CONFIG = {
  verified: {
    icon: 'circle-check',
    label: 'Verified',
    classes: 'bg-success/15 text-success border-success/30',
  },
  pending: {
    icon: 'clock',
    label: 'Pending',
    classes: 'bg-warning/15 text-warning border-warning/30',
  },
  flagged: {
    icon: 'flag',
    label: 'Flagged',
    classes: 'bg-error/15 text-error border-error/30',
  },
  uploaded: {
    icon: 'upload',
    label: 'Uploaded',
    classes: 'bg-info/15 text-info border-info/30',
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const DocumentList = ({ documents = [] }) => {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <Icon name="files" size={40} />
        <p className="mt-2 text-sm">No documents</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-base-200">
      {documents.map((doc, index) => {
        const config = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;

        return (
          <div
            key={index}
            className={clsx(
              'flex items-center gap-4 py-3 px-2',
              'transition-all duration-200',
              'hover:bg-base-200/50 rounded-lg -mx-2',
              'group',
            )}
          >
            {/* File icon */}
            <div
              className={clsx(
                'flex-none w-10 h-10 rounded-lg',
                'flex items-center justify-center',
                'bg-base-200 text-base-content/50',
                'group-hover:bg-primary/10 group-hover:text-primary',
                'transition-all duration-200',
              )}
            >
              <Icon name="file-description" size={20} />
            </div>

            {/* Document info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-content truncate">
                {doc.name}
              </p>
              {doc.date && (
                <p className="text-xs text-base-content/40 mt-0.5">
                  {formatDate(doc.date)}
                </p>
              )}
            </div>

            {/* Status badge */}
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                'text-[11px] font-semibold border',
                'flex-none',
                config.classes,
              )}
            >
              <Icon name={config.icon} size={12} />
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
