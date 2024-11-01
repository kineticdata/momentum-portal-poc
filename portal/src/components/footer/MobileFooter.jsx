import { FooterPortal } from './FooterPortal.jsx';
import { Icon } from '../../atoms/Icon.jsx';

export const MobileFooter = props => {
  return (
    <FooterPortal>
      <div className="stretch py-2 flex justify-between items-center bg-white">
        <button className="flex flex-col justify-center items-center gap-1">
          <Icon name="home"></Icon>
          <span>Home</span>
        </button>
        <button className="flex flex-col justify-center items-center gap-1">
          <span className="bg-yellow-100 p-2.5 rounded-[1.25rem] border border-blue-400">
            <Icon name="plus"></Icon>
          </span>
          <span>New Request</span>
        </button>
        <button className="flex flex-col justify-center items-center gap-1">
          <Icon name="ticket"></Icon>
          <span>Tickets</span>
        </button>
      </div>
    </FooterPortal>
  );
};
