import { Placeholder } from '../Placeholder.jsx';
import { Link } from 'react-router-dom';

export const Profile = () => {
  return (
    <Placeholder title="Profile">
      <Link to="/" className="btn">
        Home
      </Link>
    </Placeholder>
  );
};
