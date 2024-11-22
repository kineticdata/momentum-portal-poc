import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icon.jsx';
import { useSelector } from 'react-redux';
import { forwardRef } from 'react';

/**
 * Renders either a button or a link.
 *
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
const ButtonOrLink = forwardRef(({ children, ...passThroughProps }, ref) => {
  const location = useLocation();
  const isLink = !!passThroughProps.to;
  const Tag = !isLink ? 'button' : Link;
  const additionalProps = !isLink
    ? { type: 'button' }
    : { state: { backPath: location.pathname } };

  return (
    <Tag ref={ref} {...additionalProps} {...passThroughProps}>
      {children}
    </Tag>
  );
});

ButtonOrLink.propTypes = {
  children: t.node,
};

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
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'lg',
      inverse,
      underline,
      icon,
      iconEnd,
      children,
      ...passThroughProps
    },
    ref,
  ) => {
    const styledClassName = clsx(
      // Common styles for all buttons
      'border outline-0 transition',
      variant !== 'custom' &&
        'inline-flex gap-1 justify-center items-center text-center',

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

    return (
      <ButtonOrLink ref={ref} className={styledClassName} {...passThroughProps}>
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
      </ButtonOrLink>
    );
  },
);

Button.propTypes = {
  className: t.string,
  variant: t.oneOf(['primary', 'secondary', 'tertiary', 'custom']),
  size: t.oneOf(['sm', 'md', 'lg']),
  inverse: t.bool,
  underline: t.bool,
  icon: t.string,
  iconEnd: t.string,
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
      type="button"
      className={clsx(
        // Common styles
        'inline-flex gap-2 justify-center items-center text-center border outline-0 transition max-md:text-xs',
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
 * Component for rendering a tab style button or link.
 *
 * @param {string} [className]
 * @param {boolean} [active] Is the tab in an active state.
 * @param {string} [icon] Icon to render at the start of the tab.
 * @param {string} [iconEnd] Icon to render at the end of the tab.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const TabButton = ({
  className,
  active,
  icon,
  iconEnd,
  children,
  ...passThroughProps
}) => {
  const styledClassName = clsx(
    // Common styles
    'inline-flex gap-2 justify-center items-center text-center border outline-0 max-md:text-sm transition',
    // Active
    active && [
      // Text
      'text-primary-100 font-medium',
      // Background
      'bg-primary-900 disabled:bg-gray-900',
      // Border
      'border-transparent',
    ],

    // Not active
    !active && [
      // Text
      'text-gray-900 font-medium',
      // Background
      'bg-transparent hover:bg-white focus-visible:bg-white disabled:bg-transparent',
      // Border
      'border-transparent',
    ],

    // Sizing and radius
    'rounded-2.5xl px-3 py-1.75 md:py-1.25',
    className,
  );

  return (
    <ButtonOrLink className={styledClassName} {...passThroughProps}>
      {icon && <Icon name={icon} size={20} className="flex-none" />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={20} className="flex-none" />}
    </ButtonOrLink>
  );
};

TabButton.propTypes = {
  className: t.string,
  active: t.bool,
  icon: t.string,
  iconEnd: t.string,
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
    type="button"
    className={clsx(
      // Common styles
      'inline-flex gap-1 justify-center items-center transition',
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

/**
 * Component for rendering a styled category button or link.
 *
 * @param {string} [className]
 * @param {number} [index] The index of the button in a list, used to pick one
 *  of several styles for the button.
 * @param {string} [icon] The name of an icon to render in the button.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const CategoryButton = ({
  className,
  index = 0,
  icon = 'category',
  children,
  ...passThroughProps
}) => (
  <ButtonOrLink
    className={clsx(
      className,
      'group inline-flex flex-col items-center text-sm outline-0',
    )}
    {...passThroughProps}
  >
    <span
      className={clsx(
        'flex-none flex justify-center items-center transition',
        'h-[4.75rem] w-[4.75rem] rounded-2.5xl rotate-45 m-4 p-0.5',
        'bg-glassmorphism-border [--glassmorphism-angle:55deg] shadow-category',
        'group-hover:bg-none group-hover:border group-hover:border-primary-500 group-hover:shadow-category-hover',
        'group-focus-visible:bg-none group-focus-visible:border group-focus-visible:border-primary-500 group-focus-visible:shadow-category-hover',
        {
          'bg-primary-200': [0, 5].includes(index % 8),
          'bg-secondary-400': [1, 4].includes(index % 8),
          'bg-warning-200': [2, 7].includes(index % 8),
          'bg-primary-300': [3, 6].includes(index % 8),
        },
      )}
    >
      <span
        className={clsx(
          'flex-none flex justify-center items-center',
          'h-full w-full rounded-[1.125rem]',
          {
            'bg-primary-200': [0, 5].includes(index % 8),
            'bg-secondary-400': [1, 4].includes(index % 8),
            'bg-warning-200': [2, 7].includes(index % 8),
            'bg-primary-300': [3, 6].includes(index % 8),
          },
        )}
      >
        <span
          className={clsx(
            'flex-none flex justify-center items-center',
            'h-[3.25rem] w-[3.25rem] rounded-full -rotate-45 p-0.5 bg-glassmorphism-border [--glassmorphism-angle:135deg]',
            {
              'bg-gray-900': [0, 5].includes(index % 8),
              'bg-primary-900': [1, 4].includes(index % 8),
              'bg-warning-400': [2, 7].includes(index % 8),
              'bg-primary-200': [3, 6].includes(index % 8),
            },
          )}
        >
          <span
            className={clsx(
              'flex-none flex justify-center items-center',
              'h-full w-full rounded-full',
              {
                'bg-gray-900': [0, 5].includes(index % 8),
                'bg-primary-900': [1, 4].includes(index % 8),
                'bg-warning-400': [2, 7].includes(index % 8),
                'bg-primary-200': [3, 6].includes(index % 8),
              },
            )}
          >
            <Icon
              name={icon}
              size={34}
              className={clsx({
                'text-gray-900': [3, 6].includes(index % 8),
                'text-white': ![3, 6].includes(index % 8),
              })}
            />
          </span>
        </span>
      </span>
    </span>
    <span>{children}</span>
  </ButtonOrLink>
);

CategoryButton.propTypes = {
  className: t.string,
  index: t.number,
  icon: t.string,
  children: t.node,
};

/**
 * Component for rendering a styled popular service button or link.
 *
 * @param {string} [className]
 * @param {number} [index] The index of the button in a list, used to pick one
 *  of several styles for the button.
 * @param {string} [icon] The name of an icon to render in the button.
 * @param {string} [category] The name of the category the service is in.
 * @param {boolean} [small] Should the button use the small design.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const PopularServiceButton = ({
  className,
  index = 0,
  icon = 'forms',
  category,
  small = false,
  children,
  ...passThroughProps
}) => {
  return small ? (
    <ButtonOrLink
      className={clsx(
        className,
        'group inline-flex flex-col items-center gap-1 text-xs outline-0 transition',
      )}
      {...passThroughProps}
    >
      <span
        className={clsx(
          'flex-none flex justify-center items-center transition',
          'h-[4.25rem] w-[4.25rem] rounded-full p-0.5',
          'bg-gray-500 bg-glassmorphism-border [--glassmorphism-angle:135deg] shadow-icon',
          'group-hover:p-0 group-hover:border group-hover:border-primary-500',
          'group-focus-visible:p-0 group-focus-visible:border group-focus-visible:border-primary-500',
        )}
      >
        <span
          className={clsx(
            'flex-none flex justify-center items-center',
            'h-full w-full rounded-full',
            'bg-gray-500 bg-glassmorphism-linear',
          )}
        >
          <Icon name={icon} size={34} className={clsx('text-primary-200')} />
        </span>
      </span>
      <span className="text-center line-clamp-2">{children}</span>
      {category && (
        <span className="px-2 py-0.5 rounded-lg bg-secondary-100 text-gray-900 text-center line-clamp-1 mt-auto">
          {category}
        </span>
      )}
    </ButtonOrLink>
  ) : (
    <ButtonOrLink
      className={clsx(
        className,
        'group inline-flex items-stretch outline-0 transition rounded-2xl p-0.5 min-h-[10.75rem]',
        'bg-glassmorphism-border [--glassmorphism-angle:155deg] shadow-card',
        {
          'bg-secondary-400': index % 4 === 0,
          'bg-gray-500': index % 4 === 1,
          'bg-primary-900': index % 4 === 2,
          'bg-primary-400': index % 4 === 3,
        },
        {
          'text-primary-900': [0, 3].includes(index % 4),
          'text-white': [1, 2].includes(index % 4),
        },
        'hover:scale-[1.02]',
        'focus:scale-[1.02]',
      )}
      {...passThroughProps}
    >
      <div
        className={clsx(
          'flex-auto max-w-full flex flex-col gap-1 rounded-[0.875rem] px-5.5 py-4',
          'bg-glassmorphism-circular',
          {
            'bg-secondary-400': index % 4 === 0,
            'bg-gray-500': index % 4 === 1,
            'bg-primary-900': index % 4 === 2,
            'bg-primary-400': index % 4 === 3,
          },
        )}
      >
        <div className="flex items-start gap-8">
          {category && (
            <span
              className={clsx(
                'px-3 py-1.75 text-h3 font-medium rounded-full border line-clamp-1',
                {
                  'border-primary-900': [0, 3].includes(index % 4),
                  'border-white': [1, 2].includes(index % 4),
                },
              )}
            >
              {category}
            </span>
          )}
          <span
            className={clsx(
              'flex-none flex justify-center items-center transition',
              'h-[4.25rem] w-[4.25rem] rounded-full p-0.5 ms-auto',
              'bg-gray-500 bg-glassmorphism-border [--glassmorphism-angle:135deg] shadow-icon',
            )}
          >
            <span
              className={clsx(
                'flex-none flex justify-center items-center',
                'h-full w-full rounded-full',
                'bg-gray-500 bg-glassmorphism-linear',
              )}
            >
              <Icon
                name={icon}
                size={34}
                className={clsx('text-primary-200')}
              />
            </span>
          </span>
        </div>
        <div className="text-left text-h2 font-medium line-clamp-2">
          {children}
        </div>
      </div>
    </ButtonOrLink>
  );
};

PopularServiceButton.propTypes = {
  className: t.string,
  index: t.number,
  icon: t.string,
  category: t.string,
  small: t.bool,
  children: t.node,
};
