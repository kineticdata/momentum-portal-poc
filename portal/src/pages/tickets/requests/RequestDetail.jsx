import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { fetchSubmission } from '@kineticdata/react';
import { Button } from '../../../atoms/Button.jsx';
import { Icon } from '../../../atoms/Icon.jsx';
import { StatusPill } from '../../../components/tickets/StatusPill.jsx';
import { Error } from '../../../components/states/Error.jsx';
import { Loading } from '../../../components/states/Loading.jsx';
import { timeAgo } from '../../../helpers/index.js';
import { getAttributeValue } from '../../../helpers/records.js';
import useDataItem from '../../../helpers/useDataItem.js';

const parseActivityData = data => {
  if (!data) return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const Activity = ({ first, last, mobile, icon, activity }) => {
  const data = parseActivityData(activity.data);

  return (
    <div
      className={clsx(
        // Common styles
        'relative bg-white border border-primary-200 rounded-[7px] shadow-card',
        'flex flex-col items-stretch',
        // Mobile first styles
        'px-2 py-3 ml-6 gap-3',
        // Non mobile styles
        'md:px-8 md:py-7 md:ml-20 md:gap-5',
      )}
    >
      <div
        className={clsx(
          'absolute w-1 bg-success-500 h-full',
          '-left-4',
          'md:-left-[3.875rem]',
          {
            'top-0': !first,
            'top-1/2': first,
            'h-0': first && last,
            'h-[calc(50%+1.875rem)]': first && !last,
            'h-[calc(100%+1.875rem)]': !first && !last,
            'h-1/2': !first && last,
          },
        )}
      />
      <div
        className={clsx(
          'absolute flex justify-center items-center',
          'border border-success-400 bg-success-200 top-1/2 -translate-y-1/2',
          '-left-6 w-5 h-5 rounded-[5px]',
          'md:-left-20 md:w-10 md:h-10 md:rounded-[10px]',
        )}
      >
        {icon && (
          <Icon
            name={icon}
            className="text-success-500"
            size={mobile ? 12 : 24}
          />
        )}
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex-auto flex flex-col items-stretch gap-1 md:gap-2.5">
          <div className="text-xs md:text-sm text-gray-900">
            {timeAgo(activity.createdAt)}
          </div>
          <div className="max-md:text-sm font-medium">{activity.label}</div>
        </div>
        {data?.Status && (
          <div
            className={clsx(
              'flex-none',
              // Mobile first styles
              'max-md:text-xs px-3 py-0.75 rounded-full border font-medium text-center',
              // Non mobile styles
              'md:py-1.25 md:min-w-32',
              // Colors
              {
                'bg-secondary-100 text-secondary-500 border-secondary-500': ![
                  'Approved',
                  'Complete',
                  'Denied',
                  'Cancelled',
                ].includes(data?.Status),
                'bg-success-200 text-success-500 border-success-400': [
                  'Approved',
                  'Complete',
                ].includes(data?.Status),
                'bg-gray-200 text-gray-900 border-gray-500': ['Draft'].includes(
                  'Denied',
                  'Cancelled',
                ),
              },
            )}
          >
            {data?.Status}
          </div>
        )}
      </div>
      {data && (
        <div className="bg-primary-100 rounded-[7px] px-2 py-1.5 md:py-3">
          {typeof data === 'string' ? (
            data
          ) : (
            <dl
              className="max-md:text-xs flex flex-wrap gap-3 md:gap-x-12"
              style={{ overflowWrap: 'anywhere' }}
            >
              {Object.entries(data).map(
                ([key, value]) =>
                  key !== 'Status' && (
                    <div key={key} className="flex flex-col gap-0.5 md:gap-1">
                      <dt className="text-gray-900">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          )}
        </div>
      )}
    </div>
  );
};

export const RequestDetail = () => {
  const { submissionId } = useParams();
  const mobile = useSelector(state => state.view.mobile);

  const [{ initialized, loading, error, data }] = useDataItem(
    fetchSubmission,
    [
      {
        id: submissionId,
        include:
          'activities,activities.details,details,form.attributesMap[Icon]',
      },
    ],
    response => response.submission,
  );

  const icon = getAttributeValue(
    data?.form,
    'Icon',
    data ? 'checklist' : 'blank',
  );

  return (
    <>
      <div className="flex flex-col mt-4 mb-6 md:my-8">
        <div className="flex justify-between items-center gap-3 min-w-0">
          <div className="flex items-center gap-3">
            <Button
              variant="tertiary"
              icon="arrow-left"
              to=".."
              aria-label="Back"
            />
            <div className="md:h3 font-semibold line-clamp-3">
              {data?.label}
            </div>
            <span>{data && <StatusPill status={data.coreState} />}</span>
          </div>
          {!mobile && (
            <Button
              variant="tertiary"
              icon="file-check"
              to="review"
              className="whitespace-nowrap"
            >
              View Request
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-md">
        {initialized &&
          (error ? (
            <Error error={error} />
          ) : loading ? (
            <Loading />
          ) : (
            <div
              className={clsx(
                'flex flex-col items-stretch gap-5 md:gap-7 py-3',
              )}
            >
              {data?.submittedAt && (
                <Activity
                  first={true}
                  last={!data?.closedAt && data?.activities?.length === 0}
                  icon={icon}
                  mobile={mobile}
                  activity={{
                    createdAt: data.submittedAt,
                    label: 'Request Submitted',
                    data: {
                      By: data.submittedBy,
                      Handle: data.handle,
                    },
                  }}
                />
              )}
              {(data?.activities || []).map((activity, index) => (
                <Activity
                  first={!data?.submittedAt && index === 0}
                  last={
                    !data?.closedAt && index === data?.activities?.length - 1
                  }
                  key={index}
                  icon={icon}
                  mobile={mobile}
                  activity={activity}
                />
              ))}
              {data?.closedAt && (
                <Activity
                  last={true}
                  icon={icon}
                  mobile={mobile}
                  activity={{
                    createdAt: data.closedAt,
                    label: 'Request Closed',
                  }}
                />
              )}
            </div>
          ))}
      </div>

      {mobile && (
        <div className="flex justify-center py-6 mt-auto">
          <Button
            variant="secondary"
            icon="file-check"
            to="review"
            className="whitespace-nowrap"
          >
            View Request
          </Button>
        </div>
      )}
    </>
  );
};
