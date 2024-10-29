import { Placeholder } from '../Placeholder.jsx';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <Placeholder title="Home">
      <Link to="requests" className="btn">
        Requests
      </Link>
      <Link to="actions" className="btn">
        Actions
      </Link>
      <Link to="services" className="btn">
        Services
      </Link>
      <Link to="profile" className="btn">
        Profile
      </Link>
    </Placeholder>
  );
};
