import { Placeholder } from '../Placeholder.jsx';
import { Link, useParams } from 'react-router-dom';

export const ServiceForm = () => {
  const { category } = useParams();
  return (
    <Placeholder title="Service Form">
      <Link to={category ? `../${category}` : '..'} className="btn">
        Back
      </Link>
    </Placeholder>
  );
};
