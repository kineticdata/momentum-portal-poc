import clsx from 'clsx';
import t from 'prop-types';

export const Avatar = ({ username = '', size = 'sm' }) => {
  return (
    <div
      className={clsx(
        'flex justify-center items-center',
        'bg-primary-900 text-primary-200 rounded-full uppercase leading-none',
        {
          'h-4 w-4 text-xs': size === 'sm',
          'h-6 w-6 text-base': size === 'md',
          'h-12 w-12 text-h2 font-medium': size === 'lg',
        },
      )}
    >
      {username.slice(0, 1)}
    </div>
  );
};

Avatar.propTypes = {
  username: t.string,
  size: t.oneOf(['sm', 'md', 'lg']),
};
