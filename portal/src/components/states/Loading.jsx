import t from 'prop-types';
import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

export const Loading = ({ className, size = 48, small }) => (
  <div
    className={clsx(
      'flex justify-center items-center text-gray-500',
      { 'p-6': !small, 'p-3': small },
      className,
    )}
  >
    <Icon name="loader-2" className="animate-spin" size={size} />
  </div>
);

Loading.propTypes = {
  className: t.string,
  size: t.number,
  small: t.bool,
};
