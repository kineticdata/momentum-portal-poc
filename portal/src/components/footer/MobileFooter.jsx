import { Link, useMatch } from 'react-router-dom';
import { FooterPortal } from './FooterPortal.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { ServicesPanel } from '../services/ServicesPanel.jsx';

export const MobileFooter = props => {
  // Are we on request details or form pages
  const matchesActions = useMatch('/actions/:id/*');
  // Are we on action details or form pages
  const matchesRequests = useMatch('/requests/:id/*');
  // Are we on a form page
  const matchesForm = useMatch('/forms/:formSlug/*');
  const matchesForm2 = useMatch('/kapps/:kappSlug/forms/:formSlug/*');
  // Are we on the profile page
  const matchesProfile = useMatch('/profile');
  // Don't render footer if we are on any of the above pages
  if (
    matchesActions ||
    matchesRequests ||
    matchesForm ||
    matchesForm2 ||
    matchesProfile
  )
    return null;

  return (
    <FooterPortal>
      <div className="stretch py-2 flex justify-between items-center bg-base-100 text-xs shadow-footer">
        <Link
          to="/"
          className="flex flex-col justify-center items-center gap-1 ml-4"
        >
          <Icon name="home"></Icon>
          <span>Home</span>
        </Link>
        <ServicesPanel>
          <button className="flex flex-col justify-center items-center gap-1">
            <span className="bg-primary text-primary-content p-2.5 rounded-2.5xl">
              <Icon name="plus"></Icon>
            </span>
            <span>New Request</span>
          </button>
        </ServicesPanel>
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
