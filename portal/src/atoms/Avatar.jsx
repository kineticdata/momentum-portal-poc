import clsx from 'clsx';
import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 *
 * @param {string} username The username of the user, used for rendering the
 *  first letter.
 * @param {('sm'|'md'|'lg'|'xl')} [size=sm] The size of the avatar.
 * @param {string} [className]
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Avatar = ({
  username = '',
  size = 'sm',
  className,
  ...passThroughProps
}) => {
  const location = useLocation();
  const isLink = !!passThroughProps.to;
  const Tag = !isLink ? 'div' : Link;
  const additionalProps = !isLink
    ? {}
    : { state: { backPath: location.pathname } };

  return (
    <Tag
      className={clsx(
        'group flex justify-center items-center rounded-full p-0.5 outline-0 transition',
        'bg-primary-900 bg-glassmorphism-border [--glassmorphism-angle:145deg]',
        isLink && 'hover:bg-gray-500',
        isLink && 'focus-visible:bg-secondary-400',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-10 w-10': size === 'lg',
          'h-12 w-12': size === 'xl',
        },
        className,
      )}
      {...additionalProps}
      {...passThroughProps}
    >
      <div
        className={clsx(
          'flex justify-center items-center h-full w-full rounded-full transition',
          'bg-primary-900 text-primary-100 uppercase leading-none',
          isLink && 'group-hover:bg-gray-500 group-hover:text-white',
          isLink &&
            'group-focus-visible:bg-secondary-400 group-focus-visible:text-primary-900',
          {
            'text-xs': size === 'sm',
            'text-base': size === 'md',
            'text-h3 font-medium': size === 'lg',
            'text-h2 font-medium': size === 'xl',
          },
        )}
      >
        {username.slice(0, 1)}
      </div>
    </Tag>
  );
};

Avatar.propTypes = {
  username: t.string.isRequired,
  size: t.oneOf(['sm', 'md', 'lg', 'xl']),
  className: t.string,
};
