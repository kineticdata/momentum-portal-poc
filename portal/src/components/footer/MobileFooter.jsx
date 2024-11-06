import { Link } from 'react-router-dom';
import { FooterPortal } from './FooterPortal.jsx';
import { Icon } from '../../atoms/Icon.jsx';

export const MobileFooter = props => {
  return (
    <FooterPortal>
      <div className="stretch py-2 flex justify-between items-center bg-white text-xs shadow-footer">
        <Link
          to="/"
          className="flex flex-col justify-center items-center gap-1 ml-4"
        >
          <Icon name="home"></Icon>
          <span>Home</span>
        </Link>
        <button className="flex flex-col justify-center items-center gap-1">
          <span className="bg-secondary-400 p-2.5 rounded-2.5xl border border-primary-500">
            <Icon name="plus"></Icon>
          </span>
          <span>New Request</span>
        </button>
        <Link
          to="/requests"
          className="flex flex-col justify-center items-center gap-1 mr-4"
        >
          <Icon name="ticket"></Icon>
          <span>Tickets</span>
        </Link>
      </div>
    </FooterPortal>
  );
};
