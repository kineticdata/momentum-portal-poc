import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { Loading } from '../states/Loading.jsx';
import { sortBy } from '../../helpers/index.js';
import { useData } from '../../helpers/hooks/useData.js';
import { useMemo } from 'react';

const ShortcutLink = ({ title, description, icon, link, mobile }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        // Common styles
        'flex-1 flex gap-3 min-w-48 bg-base-100 rounded-2xl border border-base-300',
        'hover:border-base-content focus:border-base-content',
        // Mobile first styles
        'w-full px-3 py-1.5',
        // Non mobile styles
        'md:w-1/4 md:h-32 md:py-2.5',
      )}
    >
      <span
        className={clsx(
          'flex-none flex justify-center items-center transition',
          'h-full min-h-10 w-8 md:w-11 rounded-[7px] p-0.5',
          'bg-neutral shadow-icon',
        )}
      >
        <Icon
          name={icon}
          size={mobile ? 16 : 24}
          className="text-neutral-content"
        />
      </span>
      <div className="flex md:flex-col gap-1.5 justify-start max-md:items-center min-w-0">
        <div
          className="line-clamp-2 max-md:text-sm leading-5 md:h-10 md:font-semibold"
          style={{ overflowWrap: 'anywhere' }}
        >
          {title}
        </div>
        {!mobile && description && (
          <div className="line-clamp-3 text-base-content/60 text-sm">
            {description}
          </div>
        )}
      </div>
    </a>
  );
};

// Query for retrieving shortcuts data
const shortcutsSearch = {
  q: defineKqlQuery().equals('values[Status]', 'status').end()({
    status: 'Active',
  }),
  include: ['values'],
  limit: 6,
};

// Transform function for converting shortcuts submissions into the format
// needed for the UI
const shortcutsTransform = submissions =>
  submissions
    ?.map(({ values }) => ({
      title: values['Title'],
      description: values['Description'],
      link: values['URL'],
      icon: values['Icon Name'],
      sortOrder: parseInt(values['Sort Order'], 10) || 999,
    }))
    ?.sort(sortBy('sortOrder'));

export const ShortcutsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { kappSlug } = useSelector(state => state.app);

  // Parameters for the shortcuts query
  const params = useMemo(
    () => ({
      kapp: kappSlug,
      form: 'portal-shortcuts',
      search: shortcutsSearch,
    }),
    [kappSlug],
  );

  const { initialized, loading, response } = useData(searchSubmissions, params);
  const shortcuts = shortcutsTransform(response?.submissions);

  return (
    <div className="relative flex flex-wrap items-start gap-6 md:min-h-40 overflow-visible md:w-[calc(100%)]">
      {initialized && !response?.error && (
        <>
          {loading && <Loading />}
          {!loading &&
            shortcuts?.map((shortcut, index) => (
              <ShortcutLink key={index} mobile={mobile} {...shortcut} />
            ))}
        </>
      )}
    </div>
  );
};
