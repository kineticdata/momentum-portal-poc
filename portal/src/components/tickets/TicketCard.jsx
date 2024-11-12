import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Icon } from '../../atoms/Icon.jsx';
import { StatusPill } from './StatusPill.jsx';
import { timeAgo } from '../../helpers/index.js';

const getMetaData = submission => {
  if (['Approval', 'Task'].includes(submission.type)) {
    switch (submission.coreState) {
      case 'Submitted':
      case 'Closed':
        return {
          status: 'Closed',
          dateString: `Closed ${timeAgo(submission.submittedAt)}`,
        };
      default:
        return {
          status: 'Open',
          dateString: `Opened ${timeAgo(submission.createdAt)}`,
        };
    }
  } else if (['Service'].includes(submission.type)) {
    switch (submission.coreState) {
      case 'Draft':
        return {
          status: 'Draft',
          dateString: `Created ${timeAgo(submission.createdAt)}`,
        };
      case 'Closed':
        return {
          status: 'Closed',
          dateString: `Closed ${timeAgo(submission.closedAt)}`,
        };
      default:
        return {
          status: 'Open',
          dateString: `Submitted ${timeAgo(submission.submittedAt)}`,
        };
    }
  }
};

/**
 * Build the link path for the submission. If it is a draft request, render the
 * submission form. Otherwise, render the details route.
 */
const getToPath = submission =>
  ['Service'].includes(submission.type) && submission.coreState === 'Draft'
    ? `${submission.id}/edit`
    : submission.id;

export const MobileTicketCard = ({ submission }) => {
  const location = useLocation();
  const icon = getAttributeValue(submission?.form, 'Icon', 'checklist');
  const meta = getMetaData(submission);

  return (
    <div
      className={clsx(
        'relative p-1 bg-white rounded-xl shadow-card min-h-16 flex items-center gap-3',
      )}
    >
      <div className="bg-primary-100 border border-primary-400 text-primary-900 rounded-[7px] shadow-icon flex-none p-1.25">
        <Icon name={icon} size={16} />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <Link
          className="text-sm font-medium leading-4 line-clamp-2 after:absolute after:inset-0"
          to={getToPath(submission)}
          state={{ backPath: location.pathname }}
        >
          {submission.label}
        </Link>
        <div className="text-xs text-gray-900">{meta.dateString}</div>
      </div>
      <StatusPill status={meta.status} />
    </div>
  );
};

export const TicketCard = ({ submission }) => {
  const location = useLocation();
  const icon = getAttributeValue(submission?.form, 'Icon', 'checklist');
  const meta = getMetaData(submission);

  return (
    <div
      className={clsx(
        'relative py-3 px-6 col-start-1 col-end-5 grid grid-cols-[subgrid] gap-3 bg-white rounded-xl shadow-card min-h-16 items-center',
      )}
    >
      <div className="bg-primary-100 border border-primary-400 text-primary-900 rounded-[10px] shadow-icon flex-none p-1.75">
        <Icon name={icon} />
      </div>
      <Link
        className="font-medium leading-5 line-clamp-2 after:absolute after:inset-0"
        to={getToPath(submission)}
        state={{ backPath: location.pathname }}
      >
        {submission.label}
      </Link>
      <div className="text-gray-900">{meta.dateString}</div>
      <StatusPill status={meta.status} />
    </div>
  );
};

export const EmptyCard = ({ children }) => (
  <div
    className={clsx(
      'relative p-1 md:py-3 md:px-6 bg-white rounded-xl shadow-card min-h-16 max-md:flex md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] gap-3 items-center italic text-gray-900',
    )}
  >
    {children}
  </div>
);
