import { Placeholder } from '../Placeholder.jsx';
import { Link } from 'react-router-dom';

export const ActionsList = () => {
  return (
    <Placeholder title="Actions List">
      <Link to=".." relative="path" className="btn">
        Back
      </Link>
      <Link to="asdf" className="btn">
        To an Action
      </Link>
    </Placeholder>
  );
};
