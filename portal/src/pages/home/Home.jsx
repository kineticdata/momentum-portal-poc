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

export const Home = () => {
  const { mobile, tablet, desktop } = useSelector(state => state.view);
  const { profile, powerMode } = useSelector(state => state.app);

  return (
    <>
      <div className="l-h-between-stretch gap-14 px-14 h-64 bg-base-200">
        <div className="flex-auto l-v-center-stretch gap-10 px-30">
          <div className="text-[40px] font-semibold uppercase">
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
        <Shortcuts />
      </div>

      <div className="l-v-start-stretch gap-4 px-44 py-7">
        <div className="text-2xl font-semibold text-primary uppercase">
          Recent Activity
        </div>
        <ActivityList />
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
        limit: 6,
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
      <ul className="grid grid-cols-3 gap-x-22 gap-y-8 uppercase">
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
                  name={getAttributeValue(
                    submission?.form,
                    'Icon',
                    'checklist',
                  )}
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
        {submissions?.length === 0 && <li>There is no activity to show.</li>}
        {submissions?.length > 0 && (
          <li className="col-span-3 text-center">
            <Link to="/requests" className="kbtn kbtn-ghost">
              More
            </Link>
          </li>
        )}
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
  const mobile = useSelector(state => state.view.mobile);
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
      className="flex-none gap-3 w-89 overflow-auto grid grid-cols-2"
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
