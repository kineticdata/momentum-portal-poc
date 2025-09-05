import clsx from 'clsx';
import t from 'prop-types';

export const StatusPill = ({ className, status, value, compact }) => (
  <div
    className={clsx(
      // Mobile first styles
      'kbadge kbadge-sm uppercase rounded-box',
      // Non mobile styles
      'md:py-1.25',
      // Colors
      {
        'min-w-32': !compact,
        'bg-base-300 border-neutral': status === 'Draft',
        'bg-neutral border-success':
          status === 'Submitted' || status === 'Open',
        'bg-base-200 border-base-300': status === 'Closed',
      },
      className,
    )}
  >
    {value || status}
  </div>
);

StatusPill.propTypes = {
  status: t.oneOf(['Open', 'Closed', 'Draft', 'Submitted']),
};

export const StatusDot = ({ status }) => (
  <div
    className={clsx(
      // Mobile first styles
      'inline-block h-2 w-2 rounded-full border mb-2',
      // Colors
      {
        'bg-base-300 border-neutral': status === 'Draft',
        'bg-neutral border-success':
          status === 'Submitted' || status === 'Open',
        'bg-base-200 border-base-300': status === 'Closed',
      },
    )}
  />
);

StatusDot.propTypes = {
  status: t.oneOf(['Open', 'Closed', 'Draft', 'Submitted']),
};
