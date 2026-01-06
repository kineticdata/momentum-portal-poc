import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { useMemo } from 'react';
import { Icon } from '../../atoms/Icon.jsx';
import { Error } from '../../components/states/Error.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { sortBy } from '../../helpers/index.js';
import { useData } from '../../helpers/hooks/useData.js';
import { getAttributeValue } from '../../helpers/records.js';
import { openSearch } from '../../helpers/search.js';
import { StatusPill } from '../../components/tickets/StatusPill.jsx';
import banner from '../../assets/images/Banner.svg';

export const Home = () => {
  const { profile, powerMode } = useSelector(state => state.app);

  return (
    <>
      <div className="bg-base-200">
        <div className="flex-auto l-v-center-stretch gap-10">
          <img
            src={banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <Shortcuts />
      </div>

      <div className="l-v-start-stretch gap-4 py-2 mx-24">
        <div
          className="grid gap-7 md:gap-10 xl:gap-10 py-7 items-start"
          style={{ gridTemplateColumns: '4fr 1.5fr' }}
        >
          <div className="flex-c-st gap-4 relative">
            <div className="flex-auto l-v-center-stretch gap-2 pb-16">
              <div className="text-[24px] font-semibold uppercase">
                Hello, {profile.displayName}
              </div>
              <div className="grid grid-cols-3 gap-8">
                <button
                  type="button"
                  className="kbtn kbtn-primary kbtn-lg flex-1"
                  onClick={() => openSearch()}
                >
                  Submit a Request
                </button>
                <Link
                  to="/requests"
                  className="kbtn kbtn-secondary kbtn-outline kbtn-lg flex-1"
                >
                  Check Status
                </Link>
                {powerMode && (
                  <Link
                    to="/actions"
                    className="kbtn kbtn-secondary kbtn-outline kbtn-lg flex-1"
                  >
                    See My Work
                  </Link>
                )}
              </div>
            </div>
            <div className="text-2xl font-semibold text-primary uppercase">
              Upcoming Actions
            </div>
            <div className="kcard">
              <div className="pt-3">
                <ActivityList />
              </div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: '-3rem' }}
            >
              <Link to="/requests" className="kbtn kbtn-ghost">
                More
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-md">
            <div className="text-lg md:text-2xl font-semibold">
              Upcoming Training
            </div>
            <WorkList />
          </div>
        </div>
      </div>
    </>
  );
};

const ActivityList = () => {
  const { profile, kappSlug } = useSelector(state => state.app);
  const { username } = profile;

  // Parameters for the query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      search: {
        q: defineKqlQuery()
          // Limit form types
          .in('type', 'types')
          // Add assignment query so we only retrieve requests for the current user
          .or()
          .equals('createdBy', 'username')
          .equals('submittedBy', 'username')
          .equals('values[Requested For]', 'username')
          // End or block
          .end()
          // End query builder
          .end()({ types: ['Service'], username }),
        include: ['details', 'form', 'form.attributesMap', 'values[Status]'],
        limit: 4,
      },
    }),
    [kappSlug, username],
  );

  // Retrieve the submission record
  const data = useData(searchSubmissions, params);
  const { error, submissions } = data.response || {};

  if (data.initialized) {
    return error ? (
      <Error error={error} />
    ) : data.loading ? (
      <Loading />
    ) : (
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 uppercase">
        {submissions?.map(submission => (
          <li
            className="relative l-v-start-stretch gap-2 p-4 pb-6 rounded-box border border-neutral bg-base-200 hover:border-base-content focus-visible:border-base-content"
            key={submission.id}
          >
            <div className="l-h-end-center">
              <StatusPill
                status={
                  submission.coreState === 'Submitted'
                    ? 'Open'
                    : submission.coreState
                }
                value={submission.values.Status}
                compact
              />
            </div>
            <div className="l-h-start-start gap-6">
              <div className="l-h-center-center p-2 bg-base-100 rounded-sm">
                <Icon
                  name={getAttributeValue(submission?.form, 'Icon', 'user')}
                  size={24}
                />
              </div>
              <div className="l-v-start-stretch gap-1">
                <Link
                  to={`/requests/${submission.id}${submission.coreState === 'Draft' ? '/edit' : ''}`}
                  className="text-primary text-lg after:absolute after:inset-0"
                >
                  {submission.form.name}
                </Link>
                <small>{submission.label}</small>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }
};

const WorkList = () => {
  const { profile, kappSlug } = useSelector(state => state.app);
  const { username, memberships } = profile;

  // Parameters for the query
  const params = useMemo(
    () => ({
      kapp: 'datastore',
      form: 'upcoming-training',
      search: {
        include: ['details', 'form', 'form.attributesMap', 'values'],
        limit: 4,
      },
    }),
    [kappSlug, username, memberships],
  );

  // Retrieve the submission record
  const data = useData(searchSubmissions, params);
  const { error, submissions } = data.response || {};

  if (data.initialized) {
    return error ? (
      <Error error={error} />
    ) : data.loading ? (
      <Loading />
    ) : (
      <ul className="flex flex-col gap-3">
        {submissions?.map(submission => (
          <li
            className="relative l-v-start-stretch px-4 pt-4 pb-2 rounded-box border border-neutral bg-base-200 hover:border-base-content focus-visible:border-base-content"
            key={submission.id}
          >
            <small className={'text-sm'}>
              {submission.values['Training Dates']}
            </small>
            <Link
              to={`/actions/${submission.id}`}
              className="text-primary line-clamp-2 after:absolute after:inset-0 text-lg"
            >
              {submission.values['Training Name']}
            </Link>
            <div className="l-h-end-center text-sm">
              {submission.values['Training Location']}
            </div>
          </li>
        ))}
        {submissions?.length === 0 && <li>There is no work to show.</li>}
      </ul>
    );
  }
};

// Transform function for converting shortcuts submissions into the format
// needed for the UI
const shortcutsTransform = submissions =>
  submissions
    ?.map(({ values }) => ({
      title: values['Title'],
      link: values['URL'],
      image: values['Image'],
      newTab: values['New Tab']?.includes('Yes'),
      sortOrder: parseInt(values['Sort Order'], 10) || 999,
    }))
    ?.sort(sortBy('sortOrder'));

const Shortcuts = () => {
  const { kappSlug } = useSelector(state => state.app);

  // Parameters for the shortcuts query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      form: 'portal-shortcuts',
      search: {
        q: defineKqlQuery().equals('values[Status]', 'status').end()({
          status: 'Active',
        }),
        include: ['values'],
        limit: 10,
      },
    }),
    [kappSlug],
  );

  const { initialized, loading, response } = useData(searchSubmissions, params);
  const shortcuts = shortcutsTransform(response?.submissions);

  return (
    <div
      className="gap-3 w-89 overflow-auto grid grid-cols-2"
      style={{ scrollbarWidth: 'none' }}
    >
      {initialized &&
        !loading &&
        !response?.error &&
        shortcuts?.map((shortcut, index) => (
          <a
            key={index}
            href={shortcut.link}
            target={shortcut.newTab ? '_blank' : undefined}
            rel="noreferrer"
            className={clsx(
              'relative bg-base-300 flex-full h-36 rounded-box row-span-2 overflow-hidden',
              index === 1 && 'row-start-2',
              'hover:scale-105 transition-transform',
              {
                'hover:translate-x-1/40': index % 2 === 1,
                'hover:-translate-x-1/40': index % 2 === 0,
              },
            )}
          >
            {shortcut.image && (
              <img
                src={shortcut.image}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <small className="absolute inset-x-0 bottom-0 px-2 pt-2 pb-4 bg-black/60 text-base-content">
              <span className="font-medium line-clamp-2 text-center">
                {shortcut.title}
              </span>
            </small>
          </a>
        ))}
    </div>
  );
};
