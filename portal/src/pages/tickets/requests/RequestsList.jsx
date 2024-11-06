import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Placeholder } from '../../Placeholder.jsx';
import { TicketsTabs } from '../../../components/tickets/TicketsTabs.jsx';

export const RequestsList = () => {
  return (
    <>
      <div
        className={clsx(
          // Mobile first styles
          'my-4 flex max-md:flex-col justify-between gap-6',
          // Non mobile styles
          'md:my-6 md:items-center',
        )}
      >
        <TicketsTabs active="requests" />
      </div>

      <Placeholder title="Requests List">
        <Link to=".." relative="path" className="btn">
          Back
        </Link>
        <Link to="asdf" className="btn">
          To a Request
        </Link>
      </Placeholder>
    </>
  );
};
