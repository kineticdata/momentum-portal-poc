import t from 'prop-types';
import { TabButton } from '../../atoms/Button.js';
import clsx from 'clsx';

export const TicketsTabs = ({ active = 'requests' }) => (
  <div
    className={clsx(
      // Mobile first styles
      'px-1 py-1 rounded-2xl flex gap-6 flex-none bg-primary-100 max-md:self-center',
      // Non mobile styles
      'md:px-6 md:py-3 md:rounded-full md:gap-8',
    )}
  >
    <TabButton link to="/requests" active={active === 'requests'}>
      My Requests
    </TabButton>
    <TabButton link to="/actions" active={active === 'actions'}>
      My Actions
    </TabButton>
  </div>
);

TicketsTabs.propTypes = {
  active: t.oneOf(['requests', 'actions']),
};
