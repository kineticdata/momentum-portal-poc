import { Placeholder } from '../Placeholder.jsx';
import { Link } from 'react-router-dom';

export const RequestsList = () => {
  return (
    <Placeholder title="Requests List">
      <Link to=".." relative="path" className="btn">
        Back
      </Link>
      <Link to="asdf" className="btn">
        To a Request
      </Link>
    </Placeholder>
  );
};
