import t from 'prop-types';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icon.jsx';
import { ark } from '@ark-ui/react/factory';

/**
 * Component for rendering a styled button or link.
 *
 * @param {string} [className]
 * @param {('primary'|'secondary'|'tertiary')} [variant=primary] The styled
 *  look of the button.
 * @param {('sm'|'md'|'lg')} [size=lg] The size of the button.
 * @param {boolean} [inverse] If true, the button will invert the colors to
 *  work on a reverse color background. Only available for tertiary variant.
 * @param {string} [icon] The name of an icon to render at the start of the
 *  button.
 * @param {string} [iconEnd] The name of an icon to render at the end of the
 *  button.
 * @param {boolean} [link] If true, this component will render a Link instead
 *  of a button, but with button styles.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Button = ({
  className,
  variant = 'primary',
  size = 'lg',
  inverse,
  icon,
  iconEnd,
  link,
  children,
  ...passThroughProps
}) => {
  const styledClassName = clsx(
    // Common styles for all buttons
    'inline-flex gap-1 justify-center items-center text-center border outline-0',

    // Primary
    variant === 'primary' && [
      // Text
      'text-primary-900 focus-visible:text-primary-200 active:text-primary-200 disabled:text-gray-900 font-medium',
      // Background
      'bg-secondary-400 hover:bg-secondary-100 focus-visible:bg-primary-900 active:bg-primary-900 disabled:bg-gray-200',
      // Border
      'border-primary-500 disabled:border-primary-300',
    ],

    // Secondary
    variant === 'secondary' && [
      // Text
      'text-primary-900 disabled:text-gray-900 font-semibold',
      // Background
      'bg-white hover:bg-primary-100 focus-visible:bg-secondary-400 active:bg-secondary-400 disabled:bg-gray-100',
      // Border
      'border-primary-300',
    ],

    // Tertiary
    variant === 'tertiary' && [
      // Text
      'font-semibold',
      {
        'text-primary-900 disabled:text-gray-900': !inverse,
        'text-primary-100 hover:text-primary-900 focus-visible:text-primary-900 active:text-primary-900 disabled:text-gray-900':
          inverse,
      },
      'hover:underline focus-visible:underline active:underline disabled:no-underline',
      // Background
      'bg-transparent hover:bg-primary-100 focus-visible:bg-secondary-400 active:bg-secondary-400 disabled:bg-gray-100',
      // Border
      'border-transparent',
    ],

    // Sizing and radius
    {
      'px-4 rounded-2.5xl': !!children,
      'rounded-full': !children,
      'py-1.25': size === 'sm',
      'px-1.25': size === 'sm' && !children,
      'py-1.75': size === 'md',
      'px-1.75': size === 'md' && !children,
      'py-2.25': size === 'lg',
      'px-2.25': size === 'lg' && !children,
    },
    className,
  );

  const Tag = !link ? 'button' : Link;

  return (
    <Tag className={styledClassName} {...passThroughProps}>
      {icon && <Icon name={icon} className="flex-none" />}
      {children}
      {iconEnd && <Icon name={iconEnd} className="flex-none" />}
    </Tag>
  );
};

Button.propTypes = {
  className: t.string,
  variant: t.oneOf(['primary', 'secondary', 'tertiary']),
  size: t.oneOf(['sm', 'md', 'lg']),
  inverse: t.bool,
  icon: t.string,
  iconEnd: t.string,
  label: t.string,
  link: t.bool,
  children: t.node,
};

/**
 * Component for rendering a styled close button.
 *
 * @param {string} [className]
 * @param {('sm'|'md'|'lg')} [size=lg] The size of the button.
 * @param {boolean} [inverse] If true, the button will invert the colors to
 *  work on a reverse color background.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const CloseButton = ({
  className,
  size = 'lg',
  inverse,
  ...passThroughProps
}) => (
  <button
    className={clsx(
      // Common styles
      'inline-flex gap-1 justify-center items-center',
      // Text
      {
        'text-gray-900 hover:text-primary-900 focus-visible:text-primary-900 active:text-primary-900 disabled:text-gray-900':
          !inverse,
        'text-gray-200 hover:text-primary-300 focus-visible:text-primary-300 active:text-primary-300 disabled:text-gray-200':
          inverse,
      },
      // Background
      'bg-transparent',
      // Border
      'border border-transparent outline-0',
      // Sizing and radius
      'rounded-full p-1.25',
      className,
    )}
    aria-label="Close"
    {...passThroughProps}
  >
    <Icon
      name="circle-x"
      filled
      size={size === 'sm' ? 24 : size === 'md' ? 28 : 32}
    />
  </button>
);

CloseButton.propTypes = {
  className: t.string,
  size: t.oneOf(['sm', 'md', 'lg']),
  inverse: t.bool,
  label: t.string,
};
