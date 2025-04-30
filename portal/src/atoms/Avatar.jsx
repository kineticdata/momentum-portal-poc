import clsx from 'clsx';
import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 *
 * @param {string} username The username of the user, used for rendering the
 *  first letter.
 * @param {('sm'|'md'|'lg'|'xl')} [size=sm] The size of the avatar.
 * @param {string} [className]
 * @param {string} [asButton] Is the avatar in a button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Avatar = ({
  username = '',
  size = 'sm',
  className,
  asButton,
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
        'group flex justify-center items-center rounded-full transition uppercase leading-none',
        (isLink || asButton) && 'kbtn kbtn-accent kbtn-circle',
        !isLink && !asButton && 'bg-accent text-accent-content',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-10 w-10': size === 'lg',
          'h-12 w-12': size === 'xl',
          'h-16 w-16': size === '2xl',
          'h-24 w-24': size === '3xl',
        },
        {
          'text-xs': size === 'sm',
          'text-base': size === 'md',
          'text-h3 font-medium': size === 'lg',
          'text-h2 font-medium': size === 'xl',
          'text-h1 font-medium': size === '2xl',
          'text-5xl font-semibold': size === '3xl',
        },
        className,
      )}
      {...additionalProps}
      {...passThroughProps}
    >
      {username.slice(0, 1)}
    </Tag>
  );
};

Avatar.propTypes = {
  username: t.string.isRequired,
  size: t.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  className: t.string,
};
