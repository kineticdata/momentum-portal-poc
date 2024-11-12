import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icon.jsx';
import { useSelector } from 'react-redux';

/**
 * Component for rendering a styled button or link.
 *
 * @param {string} [className]
 * @param {('primary'|'secondary'|'tertiary'|'custom')} [variant=primary]
 *  The styled look of the button.
 * @param {('sm'|'md'|'lg')} [size=lg] The size of the button.
 * @param {boolean} [inverse] If true, the button will invert the colors to
 *  work on a reverse color background. Only available for tertiary variant.
 * @param {boolean} [underline] If true, the button's text will be underlined
 *  on hover, focus, and active.
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
  underline,
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
      'text-primary-900 focus-visible:text-primary-200 data-[state=open]:text-primary-200 disabled:text-gray-900 font-medium',
      // Background
      'bg-secondary-400 hover:bg-secondary-100 focus-visible:bg-primary-900 data-[state=open]:bg-primary-900 disabled:bg-gray-200',
      // Border
      'border-primary-500 disabled:border-primary-300',
    ],

    // Secondary
    variant === 'secondary' && [
      // Text
      'text-primary-900 disabled:text-gray-900 font-semibold',
      // Background
      'bg-white hover:bg-primary-100 focus-visible:bg-secondary-400 data-[state=open]:bg-secondary-400 disabled:bg-gray-100',
      // Border
      'border-primary-300',
    ],

    // Tertiary
    variant === 'tertiary' && [
      // Text
      'font-semibold',
      {
        'text-primary-900 disabled:text-gray-900': !inverse,
        'text-primary-100 hover:text-primary-900 focus-visible:text-primary-900 data-[state=open]:text-primary-900 disabled:text-gray-900':
          inverse,
      },
      // Background
      'bg-transparent hover:bg-primary-100 focus-visible:bg-secondary-400 data-[state=open]:bg-secondary-400 disabled:bg-gray-100',
      // Border
      'border-transparent',
    ],

    // Underline
    {
      'hover:underline focus-visible:underline data-[state=open]:underline disabled:no-underline':
        underline,
    },

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

  const location = useLocation();

  const Tag = !link ? 'button' : Link;
  const additionalProps = !link
    ? {}
    : { state: { backPath: location.pathname } };

  return (
    <Tag className={styledClassName} {...additionalProps} {...passThroughProps}>
      {icon && (
        <Icon
          name={icon}
          size={size === 'sm' ? 20 : 24}
          className="flex-none"
        />
      )}
      {children}
      {iconEnd && (
        <Icon
          name={iconEnd}
          size={size === 'sm' ? 20 : 24}
          className="flex-none"
        />
      )}
    </Tag>
  );
};

Button.propTypes = {
  className: t.string,
  variant: t.oneOf(['primary', 'secondary', 'tertiary', 'custom']),
  size: t.oneOf(['sm', 'md', 'lg']),
  inverse: t.bool,
  underline: t.bool,
  icon: t.string,
  iconEnd: t.string,
  link: t.bool,
  children: t.node,
};

/**
 * Component for rendering a chip style button.
 *
 * @param {string} [className]
 * @param {boolean} [active] Is the chip in an active state.
 * @param {string} [icon] Icon to render at the end of the chip.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const ChipButton = ({
  className,
  active,
  icon,
  children,
  ...passThroughProps
}) => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <button
      className={clsx(
        // Common styles
        'inline-flex gap-2 justify-center items-center text-center border outline-0 max-md:text-xs',
        // Active
        active && [
          // Text
          'text-primary-200 font-medium',
          // Background
          'bg-primary-900 hover:bg-gray-900 focus-visible:bg-gray-900 disabled:bg-gray-900',
          // Border
          'border-transparent',
        ],

        // Not active
        !active && [
          // Text
          'text-primary-900 font-medium',
          // Background
          'bg-white hover:bg-primary-100 focus-visible:bg-primary-100 disabled:bg-gray-200',
          // Border
          'border-gray-900',
        ],

        // Sizing and radius
        'rounded-2.5xl px-2 md:px-3 py-0.75 md:py-1.25',
        className,
      )}
      {...passThroughProps}
    >
      {children}
      {icon && (
        <Icon name={icon} size={mobile ? 12 : 20} className="flex-none" />
      )}
    </button>
  );
};

ChipButton.propTypes = {
  className: t.string,
  active: t.bool,
  icon: t.string,
  children: t.node,
};

/**
 * Component for rendering a tab style button.
 *
 * @param {string} [className]
 * @param {boolean} [active] Is the tab in an active state.
 * @param {string} [icon] Icon to render at the start of the tab.
 * @param {string} [iconEnd] Icon to render at the end of the tab.
 * @param {boolean} [link] If true, this component will render a Link instead
 *  of a button, but with tab button styles.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const TabButton = ({
  className,
  active,
  icon,
  iconEnd,
  link,
  children,
  ...passThroughProps
}) => {
  const styledClassName = clsx(
    // Common styles
    'inline-flex gap-2 justify-center items-center text-center border outline-0 max-md:text-sm',
    // Active
    active && [
      // Text
      'text-primary-200 font-medium',
      // Background
      'bg-primary-900 disabled:bg-gray-900',
      // Border
      'border-transparent',
    ],

    // Not active
    !active && [
      // Text
      'text-primary-900 font-medium',
      // Background
      'bg-transparent hover:bg-white focus-visible:bg-white disabled:bg-transparent',
      // Border
      'border-transparent',
    ],

    // Sizing and radius
    'rounded-2.5xl px-3 py-1.75 md:py-1.25',
    className,
  );

  const Tag = !link ? 'button' : Link;

  return (
    <Tag className={styledClassName} {...passThroughProps}>
      {icon && <Icon name={icon} size={20} className="flex-none" />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={20} className="flex-none" />}
    </Tag>
  );
};

TabButton.propTypes = {
  className: t.string,
  active: t.bool,
  icon: t.string,
  iconEnd: t.string,
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
        'text-gray-900 hover:text-primary-900 focus-visible:text-primary-900 disabled:text-gray-900':
          !inverse,
        'text-gray-200 hover:text-primary-300 focus-visible:text-primary-300 disabled:text-gray-200':
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
};
