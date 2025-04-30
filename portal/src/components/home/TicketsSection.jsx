import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import clsx from 'clsx';
import { TicketsTabs } from '../tickets/TicketsTabs.jsx';
import { Error } from '../states/Error.jsx';
import { Loading } from '../states/Loading.jsx';
import { HomeTicketCard } from '../tickets/TicketCard.jsx';
import { useData } from '../../helpers/hooks/useData.js';

const requestsQuery = defineKqlQuery()
  // Limit form types
  .in('type', 'types')
  // Add assignment query so we only retrieve request for the current user
  .or()
  .equals('createdBy', 'username')
  .equals('submittedBy', 'username')
  .equals('values[Requested For]', 'username')
  // End or block
  .end()
  // End query builder
  .end();

const actionsQuery = defineKqlQuery()
  // Limit form types
  .in('type', 'types')
  // Add assignment query so we only retrieve request for the current user
  .or()
  .equals('values[Assigned Individual]', 'username')
  .in('values[Assigned Team]', 'teams')
  // End or block
  .end()
  // End query builder
  .end();

export const TicketsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { profile, kappSlug } = useSelector(state => state.app);
  const { username, memberships } = profile;
  // State for which tab is currently open
  const [tab, setTab] = useState('requests');
  // State for which card is active on mobile since hover effects don't work on
  // touch devices. Stores index of the card.
  const [active, setActive] = useState(null);

  // Parameters for the requests query
  const requestsParams = useMemo(
    () => ({
      kapp: kappSlug,
      search: {
        q: requestsQuery({ types: ['Service'], username }),
        include: ['details', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [kappSlug, username],
  );

  // Retrieve the submission record
  const requestsData = useData(searchSubmissions, requestsParams);
  const { error: requestsError, submissions: requests } =
    requestsData.response || {};

  // Parameters for the actions query
  const actionsParams = useMemo(
    () => ({
      kapp: kappSlug,
      search: {
        q: actionsQuery({
          types: ['Approval', 'Task'],
          username,
          teams: memberships.map(({ team }) => team.name),
        }),
        include: ['details', 'form', 'form.attributesMap'],
        limit: 5,
      },
    }),
    [kappSlug, username, memberships],
  );

  // Retrieve the submission record
  const actionsData = useData(searchSubmissions, actionsParams);
  const { error: actionsError, submissions: actions } =
    actionsData.response || {};

  return (
    <div>
      {mobile && (
        <div className="flex justify-center font-semibold mb-2">
          Recent Activity
        </div>
      )}
      <div className="flex justify-center mb-4">
        <TicketsTabs
          active={tab}
          requestsProps={{
            onClick: () => {
              setTab('requests');
              setActive(null);
            },
            active: tab === 'requests',
          }}
          actionsProps={{
            onClick: () => {
              setTab('actions');
              setActive(null);
            },
            active: tab === 'actions',
          }}
        />
      </div>
      <div className="flex flex-col items-stretch">
        {tab === 'requests' &&
          requestsData.initialized &&
          (requestsError ? (
            <Error error={requestsError} />
          ) : (
            <>
              {requestsData.loading && <Loading />}
              {!requestsData.loading &&
                requests?.map((submission, index) => (
                  <HomeTicketCard
                    key={submission.id}
                    page="requests"
                    submission={submission}
                    index={index}
                    active={active}
                    setActive={setActive}
                    last={index === requests?.length - 1}
                  />
                ))}
              {!requestsData.loading && requests?.length === 0 && (
                <div
                  className={clsx(
                    'flex justify-center items-center italic text-base-content/60 py-6',
                  )}
                >
                  There are no requests to show.
                </div>
              )}
            </>
          ))}

        {tab === 'actions' &&
          actionsData.initialized &&
          (actionsError ? (
            <Error error={actionsError} />
          ) : (
            <>
              {actionsData.loading && <Loading />}
              {!actionsData.loading &&
                actions?.map((submission, index) => (
                  <HomeTicketCard
                    key={submission.id}
                    page="actions"
                    submission={submission}
                    index={index}
                    active={active}
                    setActive={setActive}
                    last={index === actions?.length - 1}
                  />
                ))}
              {!actionsData.loading && actions?.length === 0 && (
                <div
                  className={clsx(
                    'flex justify-center items-center italic text-base-content/60 py-6',
                  )}
                >
                  There are no actions to show.
                </div>
              )}
            </>
          ))}
      </div>
    </div>
  );
};
