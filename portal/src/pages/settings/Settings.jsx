import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { Loading } from '../../components/states/Loading.jsx';

export const SettingsHeading = ({ pageName }) => {
  const mobile = useSelector(state => state.view.mobile);

  return (
    <div className={clsx('relative l-h-start-center gap-6 my-6')}>
      <Button
        variant="tertiary"
        icon="arrow-left"
        to="./.."
        aria-label="Back"
      />
      <span className="text-xl font-semibold text-center text-balance uppercase">
        Settings{pageName && ` / ${pageName}`}
      </span>
    </div>
  );
};

export const SettingsCard = ({ icon = 'settings', to, label, description }) => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <Link
      to={to}
      className={clsx(
        // Non mobile styles
        'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid]',
        // Common styles
        'group relative',
      )}
      state={{ backPath: '/settings' }}
    >
      <div
        className={clsx(
          // Mobile first styles
          'flex py-0.75 px-1',
          // Non mobile styles
          'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] md:py-2.75 md:px-6',
          // Common styles
          'group relative gap-8 items-center min-h-16 rounded-xl',
          'bg-base-100 border border-base-300 transition',
          'hover:border-base-content focus-within:border-base-content',
        )}
      >
        <div className="bg-base-200 text-base-content rounded-box flex-none p-1.25 md:p-1.75">
          <Icon name={icon} />
        </div>
        {mobile ? (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-medium leading-4 line-clamp-2">{label}</div>
            <div className="text-base-content/60 text-xs line-clamp-2">
              {description}
            </div>
          </div>
        ) : (
          <>
            <div className="font-medium leading-5 line-clamp-2">{label}</div>
            <div className="text-base-content/60 line-clamp-2">
              {description}
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

export const Settings = ({ settings }) => {
  const mobile = useSelector(state => state.view.mobile);

  return (
    <>
      <SettingsHeading />

      <div className="flex flex-col gap-4 mb-4 md:mb-6 md:grid md:grid-cols-[auto_auto_1fr]">
        {!settings ? (
          mobile ? (
            <Loading xsmall size={36} />
          ) : (
            <Loading className="col-start-1 col-end-5" />
          )
        ) : (
          settings.map(link => <SettingsCard key={link.to} {...link} />)
        )}
      </div>
    </>
  );
};
