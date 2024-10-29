import { Placeholder } from '../Placeholder.jsx';
import { Link, useParams } from 'react-router-dom';

export const ServicesList = () => {
  const { category } = useParams();
  return (
    <Placeholder title={'Services List' + (category ? ` - [${category}]` : '')}>
      <Link to=".." relative="path" className="btn">
        Back
      </Link>
      <Link to="it" className="btn">
        To a Category
      </Link>
      <Link to="forms/slug" className="btn">
        To a Form
      </Link>
    </Placeholder>
  );
};
