import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { SearchModal } from '../search/SearchModal.jsx';
import { UserMenu } from '../header/UserMenu.jsx';

export const WelcomeSection = () => {
  const { mobile, desktop } = useSelector(state => state.view);
  const { profile } = useSelector(state => state.app);
  return !mobile ? (
    <div className="h-44 flex flex-col justify-between py-3">
      <div className="h1 text-balance line-clamp-2">
        {desktop ? 'Welcome back' : 'Hi'} {profile.displayName || ''}
      </div>
      <SearchModal>
        <Button
          variant="custom"
          className={clsx(
            'inline-flex justify-start items-center gap-6 rounded-full',
            'text-gray-500 bg-white border-primary-400 font-medium',
            'hover:bg-primary-100 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-secondary-400',
          )}
          aria-label="Open Search"
        >
          <span className="rounded-full flex justify-center items-center bg-primary-900 text-primary-200 p-1.25">
            <Icon name="search" size={18} />
          </span>
          How can we help?
        </Button>
      </SearchModal>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <UserMenu username={profile.username} size="lg" />
      <span className="font-medium line-clamp-2 leading-5">
        Hi {profile.displayName || ''}
      </span>
      <SearchModal>
        <Button
          variant="tertiary"
          icon="search"
          aria-label="Open Search"
          className="ml-auto flex-none"
        />
      </SearchModal>
    </div>
  );
};
