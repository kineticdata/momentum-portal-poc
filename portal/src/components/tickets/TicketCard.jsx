import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Icon } from '../../atoms/Icon.jsx';
import { StatusPill } from './StatusPill.jsx';
import { callIfFn, timeAgo } from '../../helpers/index.js';
import { useSelector } from 'react-redux';
import { Button } from '../../atoms/Button.jsx';
import { openConfirm } from '../../helpers/confirm.js';
import { deleteSubmission } from '@kineticdata/react';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import useSwipe from '../../helpers/hooks/useSwipe.js';

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
          canDelete: true,
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

/**
 * Handler for deleting a draft request.
 */
const handleDelete = (id, reload) =>
  openConfirm({
    title: 'Delete Draft',
    description: 'Are you sure you want to delete this draft request?',
    acceptLabel: 'Delete',
    accept: () =>
      deleteSubmission({ id }).then(({ error }) => {
        if (error) {
          toastError({
            title: 'Failed to delete draft request',
            description: error.message,
          });
        } else {
          toastSuccess({ title: 'Successfully deleted draft request' });
          callIfFn(reload);
        }
      }),
  });

export const TicketCard = ({ submission, reload }) => {
  const mobile = useSelector(state => state.view.mobile);
  const location = useLocation();
  const icon = getAttributeValue(submission?.form, 'Icon', 'checklist');
  const meta = getMetaData(submission);
  const { onTouchStart, onTouchMove, onTouchEnd, left, right } = useSwipe({
    threshold: 80,
    onLeftSwipe: () => handleDelete(submission.id, reload),
  });

  return (
    <div
      className={clsx(
        // Non mobile styles
        'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid]',
        // Common styles
        'group relative',
      )}
      onTouchStart={mobile && meta.canDelete ? onTouchStart : undefined}
      onTouchMove={mobile && meta.canDelete ? onTouchMove : undefined}
      onTouchEnd={mobile && meta.canDelete ? onTouchEnd : undefined}
    >
      {mobile && meta.canDelete && (
        <div
          className={clsx(
            'absolute top-0 right-0.25 h-full w-24 pl-4',
            'flex flex-col justify-center items-center gap-1',
            'bg-error text-error-content rounded-r-xl',
          )}
        >
          <Icon name="trash" />
          <span className="text-xs font-medium">Delete</span>
        </div>
      )}
      <div
        className={clsx(
          // Mobile first styles
          'flex py-0.75 px-1',
          // Non mobile styles
          'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] md:py-2.75 md:px-6',
          // Common styles
          'group relative gap-3 items-center min-h-16 rounded-xl',
          'bg-base-100 shadow-card border border-transparent transition',
          'hover:border-base-content hover:bg-base-200 hover:shadow-card-hover',
          'focus-within:border-base-content focus-within:bg-base-200 focus-within:shadow-card-hover',
        )}
        style={{ left, right }}
      >
        <div className="bg-base-200 border border-base-300 text-base-content/60 rounded-xl shadow-icon flex-none p-1.25 md:p-1.75">
          <Icon name={icon} />
        </div>
        {mobile ? (
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              className="text-sm font-medium leading-4 line-clamp-2 after:absolute after:inset-0 outline-0"
              to={getToPath(submission)}
              state={{ backPath: location.pathname }}
            >
              {submission.label}
            </Link>
            <div className="text-xs text-base-content/60">{meta.dateString}</div>
          </div>
        ) : (
          <>
            <Link
              className="font-medium leading-5 line-clamp-2 after:absolute after:inset-0 outline-0"
              to={getToPath(submission)}
              state={{ backPath: location.pathname }}
            >
              {submission.label}
            </Link>
            <div className="text-base-content/60">{meta.dateString}</div>
          </>
        )}
        <div className="max-md:ml-auto flex gap-2 items-center">
          <StatusPill
            className={clsx({
              'group-hover:min-w-20 group-focus-within:min-w-20':
                !mobile && meta.canDelete,
            })}
            status={meta.status}
          />
          {!mobile && meta.canDelete && (
            <Button
              variant="secondary"
              icon="trash"
              size="md"
              className={clsx(
                'relative -my-1 not-group-hover:not-group-focus-within:hidden',
              )}
              onClick={() => handleDelete(submission.id, reload)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyCard = ({ children }) => (
  <div
    className={clsx(
      'relative p-1 md:py-3 md:px-6 bg-base-100 rounded-xl shadow-card min-h-16 max-md:flex md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] gap-3 items-center italic text-base-content/60',
    )}
  >
    {children}
  </div>
);

export const HomeTicketCard = ({
  page,
  submission,
  index,
  active,
  setActive,
  last,
}) => {
  const mobile = useSelector(state => state.view.mobile);
  const icon = getAttributeValue(submission?.form, 'Icon', 'checklist');
  const meta = getMetaData(submission);

  return (
    <div
      className={clsx(
        'group bg-transparent drop-shadow-card transition-all',
        'hover:drop-shadow-card-hover pb-1',
        'focus-within:drop-shadow-card-hover',
        !last && '-mb-[4.125rem] md:-mb-[4.5rem] hover:mb-0 focus-within:mb-0',
      )}
      aria-expanded={mobile ? active === index || !!last : undefined}
    >
      <div
        className={clsx(
          // Mobile first styles
          'py-2.5 px-4',
          // Non mobile styles
          'md:py-3',
          // Common styles
          'relative rounded-xl bg-base-100',
          'shadow-card border border-base-300 transition-all',
          'group-hover:border-base-content',
          'group-focus-within:border-base-content',
        )}
        style={{
          maskImage: !mobile
            ? 'radial-gradient(circle at 0% 5.25rem, transparent 0.625rem, white 0.6875rem),radial-gradient(circle at 100% 5.25rem, transparent 0.625rem, white 0.6875rem)'
            : 'radial-gradient(circle at 0% 4.375rem, transparent 0.625rem, white 0.6875rem),radial-gradient(circle at 100% 4.375rem, transparent 0.625rem, white 0.6875rem)',
          maskComposite: 'intersect',
        }}
      >
        <div className="flex gap-4">
          <div
            className={clsx(
              'flex-none h-11 w-11 md:h-14 md:w-14 flex justify-center items-center rounded-full border border-base-300 bg-base-200 text-base-content/60',
            )}
          >
            <Icon name={icon} size={32} />
          </div>
          <div className="flex-auto min-w-0">
            <Link
              className="block md:text-h3 font-medium text-right truncate after:absolute after:inset-0 outline-0"
              to={page ? `/${page}/${getToPath(submission)}` : undefined}
              state={{ backPath: `/${page}` }}
              onClick={e => {
                if (mobile) {
                  // If the clicked card isn't active, or isn't the last card,
                  // expand it on first click instead of following the link
                  if (active !== index && !last) {
                    e.preventDefault();
                    setActive(index);
                  }
                }
              }}
            >
              {submission.label}
            </Link>
            <div
              className={clsx(
                'max-md:text-sm text-right truncate text-base-content/60',
              )}
            >
              {meta.dateString}
            </div>
          </div>
        </div>
        <hr className={clsx('mt-3.75 mb-3.5 border-dashed')} />
        <div className="flex justify-center">
          <StatusPill status={meta.status} />
        </div>
      </div>
    </div>
  );
};
