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

export const Home = () => {
  const { mobile, tablet, desktop } = useSelector(state => state.view);
  const { profile } = useSelector(state => state.app);

  return (
    <>
      <div className="l-h-between-stretch gap-14 px-14 h-64 bg-base-200">
        <div className="flex-auto l-v-center-stretch gap-10 px-30">
          <div className="text-6xl font-semibold">
            Hello, {profile.displayName}
          </div>
          <div className="l-h-between-center gap-8">
            <button
              type="button"
              className="kbtn kbtn-primary kbtn-xl flex-1"
              onClick={() => openSearch()}
            >
              Submit a Request
            </button>
            <Link to="/requests" className="kbtn kbtn-outline kbtn-xl flex-1">
              Check Status
            </Link>
            <Link to="/actions" className="kbtn kbtn-outline kbtn-xl flex-1">
              See My Work
            </Link>
          </div>
        </div>
        <Shortcuts />
      </div>

      <div className="l-v-start-stretch 2xl:l-h-between-start gap-20 px-44 py-7">
        <div className="flex-1 l-v-start-stretch gap-4">
          <div className="text-2xl font-semibold">Recent Activity</div>
          <div className="px-5 py-4 border rounded-box">
            <ActivityList />
          </div>
        </div>
        <div className="flex-1 l-v-start-stretch gap-4">
          <div className="text-2xl font-semibold">My Team&#39;s Requests</div>
          <div className="px-5 py-4 border rounded-box">
            <ul className="klist text-base">
              <li className="klist-row items-center">
                <div className="klist-col-grow">Need Review</div>
                <div>3</div>
              </li>
              <li className="klist-row items-center">
                <div className="klist-col-grow">In Progress</div>
                <div>13</div>
              </li>
              <li className="klist-row items-center">
                <div className="klist-col-grow">Completed This Week</div>
                <div>23</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="l-v-start-stretch gap-4 px-44 py-7">
        <div className="text-2xl font-semibold">Metrics</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] items-start gap-8">
          <Metric value={12} label="Active Submissions" />
          <Metric value={7} label="Overdue Items Last Month" />
          <Metric value={5.6} label="Avg. Days to Complete" />
        </div>
      </div>
    </>
  );
};

const Metric = ({ value, label }) => (
  <div className="l-v-center-center gap-4">
    <div className="px-6 py-4 border rounded-box min-w-18 l-h-center-center">
      {value}
    </div>
    <span className="font-medium">{label}</span>
  </div>
);

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
        include: ['details', 'form', 'form.attributesMap'],
        limit: 5,
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
      <ul className="klist text-base">
        {submissions?.map(submission => (
          <li
            className="klist-row items-center hover:bg-base-200"
            key={submission.id}
          >
            <div className="l-h-center-center -my-3 h-9 w-9 bg-base-200 rounded-box">
              <Icon
                name={getAttributeValue(submission?.form, 'Icon', 'checklist')}
              />
            </div>
            <Link
              to={`/requests/${submission.id}${submission.coreState === 'Draft' ? '/edit' : ''}`}
              className="after:absolute after:inset-0"
            >
              {submission.label}
            </Link>
            <div>{submission.coreState}</div>
          </li>
        ))}
        {submissions?.length === 0 && <li>There is no activity to show.</li>}
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
            <small className="absolute inset-x-0 bottom-0 px-2 pt-2 pb-4 bg-black/60 text-white">
              <span className="font-medium line-clamp-2 text-center">
                {shortcut.title}
              </span>
            </small>
          </a>
        ))}
    </div>
  );
};
