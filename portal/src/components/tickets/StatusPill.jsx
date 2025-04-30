import clsx from 'clsx';
import t from 'prop-types';

export const StatusPill = ({ className, status }) => (
  <div
    className={clsx(
      // Mobile first styles
      'kbadge kbadge-lg',
      // Non mobile styles
      'md:py-1.25 md:min-w-32',
      // Colors
      {
        'kbadge-info': status === 'Draft',
        'kbadge-success': status === 'Submitted' || status === 'Open',
        'bg-base-300': status === 'Closed',
      },
      className,
    )}
  >
    {status}
  </div>
);

StatusPill.propTypes = {
  status: t.oneOf(['Open', 'Closed', 'Draft', 'Submitted']),
};

export const StatusDot = ({ status }) => (
  <div
    className={clsx(
      // Mobile first styles
      'inline-block h-3 w-3 rounded-full border',
      // Non mobile styles
      'md:h-4 md:w-4',
      // Colors
      {
        'bg-info': status === 'Draft',
        'bg-success': status === 'Submitted' || status === 'Open',
        'bg-base-300': status === 'Closed',
      },
    )}
  />
);

StatusDot.propTypes = {
  status: t.oneOf(['Open', 'Closed', 'Draft', 'Submitted']),
};
