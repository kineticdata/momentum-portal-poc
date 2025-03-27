import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { ServicesPanel } from '../services/ServicesPanel.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { Loading } from '../states/Loading.jsx';
import { sortBy } from '../../helpers/index.js';
import { useData } from '../../helpers/hooks/useData.js';
import { useMemo } from 'react';

const ShortcutLink = ({ title, description, icon, link, index, mobile }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        // Common styles
        'flex-1 flex gap-3 min-w-48 bg-gray-100 rounded-2xl border border-primary-300',
        'hover:border-primary-900 focus:border-primary-900',
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
          'bg-glassmorphism-border shadow-icon',
          {
            'bg-primary-300': index % 3 === 0,
            'bg-secondary-400': index % 3 === 1,
            'bg-warning-200': index % 3 === 2,
          },
        )}
      >
        <span
          className={clsx(
            'flex-none flex justify-center items-center',
            'h-full min-h-9 w-full rounded-[7px]',
            {
              'bg-primary-300': index % 3 === 0,
              'bg-secondary-400': index % 3 === 1,
              'bg-warning-200': index % 3 === 2,
            },
          )}
        >
          <span
            className={clsx(
              'flex-none flex justify-center items-center',
              'h-6 md:h-8 w-6 md:w-8 rounded-full',
              {
                'bg-primary-900': index % 3 === 0,
                'bg-secondary-500': index % 3 === 1,
                'bg-warning-400': index % 3 === 2,
              },
            )}
          >
            <Icon
              name={icon}
              size={mobile ? 16 : 24}
              className={clsx({
                'text-primary-200': index % 3 === 0,
                'text-white': index % 3 !== 0,
              })}
            />
          </span>
        </span>
      </span>
      <div className="flex md:flex-col gap-1.5 justify-start max-md:items-center min-w-0">
        <div
          className="line-clamp-2 max-md:text-sm leading-5 md:h-10 md:font-semibold"
          style={{ overflowWrap: 'anywhere' }}
        >
          {title}
        </div>
        {!mobile && description && (
          <div className="line-clamp-3 text-gray-900 text-sm">
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
    <div className="relative md:min-h-40 overflow-visible">
      <div
        className={clsx(
          // Common styles
          'flex flex-wrap items-start',
          // Mobile first styles
          'gap-1',
          // Non mobile styles
          'md:w-[calc(100%-3rem)] xl:w-[calc(100%-1rem)]',
          'md:bg-white md:rounded-2xl md:p-4 md:pr-28 md:gap-6',
        )}
        style={{
          maskImage: !mobile
            ? 'radial-gradient(circle at 100% 5.5rem, transparent 6.25rem, white 6.3125rem)'
            : 'none',
        }}
      >
        {initialized && !response?.error && (
          <>
            {loading && <Loading />}
            {!loading &&
              shortcuts?.map((shortcut, index) => (
                <ShortcutLink
                  key={index}
                  index={index}
                  mobile={mobile}
                  {...shortcut}
                />
              ))}
          </>
        )}
      </div>

      {!mobile && (
        <ServicesPanel>
          <button
            type="button"
            className={clsx(
              'group inline-flex flex-col items-center gap-1 outline-0 font-semibold',
            )}
          >
            <span
              className={clsx(
                'absolute md:-right-8 xl:-right-16 top-2',
                'flex-none flex justify-center items-center transition',
                'h-40 w-40 rounded-full p-0.5',
                'bg-primary-900 bg-glassmorphism-border [--glassmorphism-angle:145deg]',
                'group-hover:bg-gray-500',
                'group-focus-visible:bg-secondary-400 data-[state=open]:bg-secondary-400',
              )}
            >
              <span
                className={clsx(
                  'flex flex-col justify-center items-center gap-2',
                  'h-full w-full rounded-full transition',
                  'bg-primary-900 text-primary-100',
                  'group-hover:bg-gray-500 group-hover:text-white',
                  'group-focus-visible:bg-secondary-400 group-focus-visible:text-gray-950',
                )}
              >
                <Icon name="file-plus" size={48} />
                <span>New Request</span>
              </span>
            </span>
          </button>
        </ServicesPanel>
      )}
    </div>
  );
};
