import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/images/IPPSA.svg';
import { Icon } from '../../atoms/Icon.jsx';
import { HeaderPortal } from './HeaderPortal.jsx';
import { appActions } from '../../helpers/state.js';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Popover, usePopover } from '@ark-ui/react/popover';
import clsx from 'clsx';
import { openSearch } from '../../helpers/search.js';
import { callIfFn } from '../../helpers/index.js';

export const DesktopHeader = () => {
  const username = useSelector(state => state.app.profile?.username);
  const powerMode = useSelector(state => state.app.powerMode);
  const themeLogo = useSelector(state => state.theme.logo);

  return (
    <HeaderPortal>
      <nav
        className={clsx('relative l-h-start-center gap-5 h-20 px-6 py-2 z-20 border-b-4', {
          'bg-base-100 border-transparent': !powerMode,
          'bg-base-300 border-primary': powerMode,
        })}
      >
        <HeaderMenu />
        <Link to="/" className="flex-initial" aria-label="Home">
          <img src={themeLogo || logo} alt="Logo" className="logo" />
        </Link>
        <div className="mx-auto" />
        <button
          className="kbtn kbtn-ghost kbtn-square kbtn-lg"
          onClick={() => openSearch({ searchOnly: true })}
        >
          <Icon name="search" size={20} />
        </button>
        <div
          className={clsx(
            'py-2 px-3 rounded-field flex gap-1 flex-none bg-neutral max-md:self-center uppercase',
          )}
        >
          <button
            type="button"
            className={clsx('kbtn kbtn-sm px-5 text-lg font-normal', {
              'bg-transparent border-transparent hover:border-secondary focus-visible:border-secondary hover:bg-base-300 focus-visible:bg-base-300':
                powerMode,
              'border-secondary': !powerMode,
            })}
            onClick={() => appActions.setPowerMode(false)}
          >
            Soldier
          </button>
          <button
            type="button"
            className={clsx('kbtn kbtn-sm px-5 text-lg font-normal', {
              'bg-transparent border-transparent hover:border-secondary focus-visible:border-secondary hover:bg-base-300 focus-visible:bg-base-300':
                !powerMode,
              'border-secondary': powerMode,
            })}
            onClick={() => appActions.setPowerMode(true)}
          >
            Commander
          </button>
        </div>
        <Avatar
          username={username}
          size="lg"
          color="neutral"
          className="flex-none"
          as="link"
          to="/profile"
        />
      </nav>
    </HeaderPortal>
  );
};

// const MENU_ITEMS = [
//   {
//     items: [
//       { label: 'Home', to: '/' },
//       { label: 'Submit a Request', onClick: () => openSearch() },
//       { label: 'Check Status', to: '/requests' },
//       { label: 'My Work', to: '/actions' },
//     ],
//   },
//   {
//     title: 'Manager',
//     items: [
//       { label: 'Team Metrics', to: '/manager/metrics' },
//       { label: 'Work Assigned to Team', to: '/manager/work' },
//     ],
//   },
//   {
//     title: 'Process Owner',
//     items: [
//       { label: 'Performance', to: '/owner/performance' },
//       { label: 'Submission Data', to: '/owner/submission' },
//     ],
//   },
// ];

const HeaderMenu = () => {
  const powerMode = useSelector(state => state.app.powerMode);
  const popover = usePopover();
  const close = () => popover.setOpen(false);

  const MENU_ITEMS = useMemo(
    () => [
      {
        items: [
          { label: 'Home', to: '/' },
          { label: 'Submit a Request', onClick: () => openSearch() },
          { label: 'Check Status', to: '/requests' },
          powerMode && { label: 'My Work', to: '/actions' },
        ].filter(Boolean),
      },
    ],
    [powerMode],
  );

  return (
    <Popover.RootProvider value={popover} autoFocus={false}>
      <Popover.Trigger asChild>
        <button className="kbtn kbtn-ghost kbtn-square kbtn-xl">
          <Icon name="menu-2" size={20} />
        </button>
      </Popover.Trigger>
      {popover.open && (
        // Custom backdrop for the menu
        <div
          data-scope="menu"
          data-part="dialog"
          data-state="open"
          aria-hidden="true"
          className="fixed inset-0 top-20 bg-black/20"
        />
      )}
      <Popover.Positioner
        className={clsx('!fixed !inset-0 !top-20 w-80', {
          'pointer-events-none': !popover.open,
        })}
        style={{ transform: 'none' }}
      >
        <Popover.Content className="l-v-start-stretch h-full w-full gap-3 px-6 py-4 outline-0 bg-base-100 z-30">
          <ul className="kmenu flex-nowrap gap-3 p-0 w-full flex-auto overflow-auto">
            {MENU_ITEMS.map((item, i) => (
              <Fragment key={i}>
                {i !== 0 && <hr />}
                <HeaderMenuItem {...item} close={close} />
              </Fragment>
            ))}
          </ul>
          <ul className="kmenu p-0 w-full gap-3 flex-none">
            <hr />
            <HeaderMenuItem
              label="Settings"
              to="/settings"
              icon="settings"
              close={close}
            />
          </ul>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.RootProvider>
  );
};

const HeaderMenuItem = ({ label, to, onClick, icon, title, items, close }) => {
  if (items) {
    if (title) {
      return (
        <li>
          <details>
            <summary className="content-center h-8 text-xs uppercase">
              {title}
            </summary>
            <ul>
              {items.map((item, i) => (
                <HeaderMenuItem key={i} {...item} close={close} />
              ))}
            </ul>
          </details>
        </li>
      );
    }
    return items.map((item, i) => (
      <HeaderMenuItem key={i} {...item} close={close} />
    ));
  }
  return (
    <li className="border-b border-secondary overflow-hidden">
      {to ? (
        <Link to={to} className="content-center h-12 text-base uppercase" onClick={close}>
          {icon && <Icon name={icon} />}
          <span>{label || to}</span>
        </Link>
      ) : (
        <button
          type="button"
          className="content-center h-12 text-base uppercase"
          onClick={() => {
            callIfFn(onClick);
            close();
          }}
        >
          {icon && <Icon name={icon} />}
          <span>{label || to}</span>
        </button>
      )}
    </li>
  );
};
