import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/images/logo-dark.svg';
import { HeaderPortal } from './HeaderPortal.jsx';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Button } from '../../atoms/Button.js';

export const DesktopHeader = props => {
  const username = useSelector(state => state.app.profile?.username);

  return (
    <HeaderPortal>
      <nav className="stretch py-3 flex items-center gap-5 lg:gap-10 bg-white">
        <Link to="/" className="flex-none" aria-label="Home">
          <img src={logo} alt="Logo" className="h-12" />
        </Link>
        <Button link variant="tertiary" to="requests">
          Tickets
        </Button>
        <div className="mx-auto" />
        <Button variant="tertiary" icon="search" aria-label="Search" />
        <Button link variant="secondary" icon="file-plus" to="services">
          New Request
        </Button>
        <Link to="/profile" className="flex-none" aria-label="Profile">
          <Avatar username={username} size="lg" />
        </Link>
      </nav>
    </HeaderPortal>
  );
};
