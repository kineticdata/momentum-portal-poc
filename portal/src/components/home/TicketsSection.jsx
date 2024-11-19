import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import useDataList from '../../helpers/useDataList.js';
import clsx from 'clsx';
import { TicketsTabs } from '../tickets/TicketsTabs.jsx';
import { Error } from '../states/Error.jsx';
import { Loading } from '../states/Loading.jsx';
import { HomeTicketCard } from '../tickets/TicketCard.jsx';

export const TicketsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { profile, kappSlug } = useSelector(state => state.app);
  // State for which tab is currently open
  const [tab, setTab] = useState('requests');
  // State for which card is active on mobile since hover effects don't work on
  // touch devices. Stores index of the card.
  const [active, setActive] = useState(null);

  const searchRequests = useMemo(() => {
    // Start query builder
    const search = defineKqlQuery();
    // Limit form types
    search.in('type', 'types');
    // Add assignment query so we only retrieve request for the current user
    search.or();
    search.equals('createdBy', 'username');
    search.equals('submittedBy', 'username');
    search.equals('values[Requested For]', 'username');
    // End or block
    search.end();
    // End query builder
    search.end();

    return {
      q: search.end()({
        types: ['Service'],
        username: profile.username,
      }),
      include: ['details', 'form', 'form.attributesMap'],
      limit: 5,
    };
  }, [profile]);

  // Get my requests data
  const [requestsData] = useDataList(
    searchSubmissions,
    [{ kapp: kappSlug, search: searchRequests }],
    ({ submissions }) => submissions,
  );

  const searchActions = useMemo(() => {
    // Start query builder
    const search = defineKqlQuery();
    // Limit form types
    search.in('type', 'types');
    // Add assignment query so we only retrieve request for the current user
    search.or();
    search.equals('values[Assigned Individual]', 'username');
    search.in('values[Assigned Team]', 'teams');
    // End or block
    search.end();
    // End query builder
    search.end();

    return {
      q: search.end()({
        types: ['Approval', 'Task'],
        username: profile.username,
        teams: profile.memberships.map(({ team }) => team.name),
      }),
      include: ['details', 'form', 'form.attributesMap'],
      limit: 5,
    };
  }, [profile]);

  // Get my actions data
  const [actionsData] = useDataList(
    searchSubmissions,
    [{ kapp: kappSlug, search: searchActions }],
    ({ submissions }) => submissions,
  );

  return (
    <div className={clsx('md:p-10 md:pt-5 md:bg-white md:rounded-2xl')}>
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
          (requestsData.error ? (
            <Error error={requestsData.error} />
          ) : (
            <>
              {requestsData.loading && <Loading />}
              {!requestsData.loading &&
                requestsData.data.map((submission, index) => (
                  <HomeTicketCard
                    key={submission.id}
                    page="requests"
                    submission={submission}
                    index={index}
                    active={active}
                    setActive={setActive}
                    last={index === requestsData.data.length - 1}
                  />
                ))}
              {!requestsData.loading && requestsData.data.length === 0 && (
                <div
                  className={clsx(
                    'flex justify-center items-center italic text-gray-900 py-6',
                  )}
                >
                  There are no requests to show.
                </div>
              )}
            </>
          ))}

        {tab === 'actions' &&
          actionsData.initialized &&
          (actionsData.error ? (
            <Error error={actionsData.error} />
          ) : (
            <>
              {actionsData.loading && <Loading />}
              {!actionsData.loading &&
                actionsData.data.map((submission, index) => (
                  <HomeTicketCard
                    key={submission.id}
                    page="actions"
                    submission={submission}
                    index={index}
                    active={active}
                    setActive={setActive}
                    last={index === actionsData.data.length - 1}
                  />
                ))}
              {!actionsData.loading && actionsData.data.length === 0 && (
                <div
                  className={clsx(
                    'flex justify-center items-center italic text-gray-900 py-6',
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
