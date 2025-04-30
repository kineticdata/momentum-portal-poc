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
 * @param {('xs'|'sm'|'md'|'lg'|'xl'|'custom')} [size=lg] The size of the button.
 * @param {string} [icon] The name of an icon to render at the start of the
 *  button.
 * @param {string} [iconEnd] The name of an icon to render at the end of the
 *  button.
 * @param {boolean} [openable] Should the button have styling for open state.
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
      icon,
      iconEnd,
      openable,
      children,
      ...passThroughProps
    },
    ref,
  ) => {
    const styledClassName = clsx(
      variant !== 'custom' && 'kbtn',
      variant === 'primary' && ['kbtn-primary'],
      variant === 'secondary' && ['kbtn-outline'],
      variant === 'tertiary' && ['kbtn-ghost'],
      openable && 'data-[state=open]:kbtn-active',
      size !== 'custom' && {
        'kbtn-circle': !children,
        'kbtn-xs': size === 'xs',
        'kbtn-sm': size === 'sm',
        'kbtn-md': size === 'md',
        'kbtn-lg': size === 'lg',
        'kbtn-xl': size === 'xl',
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
  size: t.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'custom']),
  inverse: t.bool,
  underline: t.bool,
  icon: t.string,
  iconEnd: t.string,
  openable: t.bool,
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
        'kbtn kbtn-sm',
        active && 'kbtn-neutral',
        !active && 'kbtn-outline',
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
    'kbtn kbtn-sm',
    active && 'kbtn-neutral',
    !active && 'kbtn-ghost hover:bg-base-100 focus-visible:bg-base-100',
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
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const CloseButton = ({
  className,
  size = 'lg',
  ...passThroughProps
}) => (
  <button
    type="button"
    className={clsx(
      'kbtn kbtn-ghost kbtn-circle bg-transparent border-transparent',
      'opacity-70 hover:opacity-100 focus-visible:opacity-100',
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
 * @param {string} [icon] The name of an icon to render in the button.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const CategoryButton = ({
  className,
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
        'flex-none flex justify-center items-center transition bg-base-300',
        'h-[4.75rem] w-[4.75rem] rounded-2.5xl rotate-45 m-4 p-0.5 shadow-category',
        'group-hover:bg-none group-hover:border group-hover:border-base-content group-hover:shadow-category-hover',
        'group-focus-visible:bg-none group-focus-visible:border group-focus-visible:border-base-content group-focus-visible:shadow-category-hover',
      )}
    >
      <span
        className={clsx(
          'flex-none flex justify-center items-center',
          'h-[3.25rem] w-[3.25rem] rounded-full -rotate-45 p-0.5',
          'bg-base-200',
        )}
      >
        <Icon name={icon} size={34} />
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
 * @param {string} [icon] The name of an icon to render in the button.
 * @param {string} [category] The name of the category the service is in.
 * @param {boolean} [small] Should the button use the small design.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const PopularServiceButton = ({
  className,
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
          'bg-base-100 border border-base-300 shadow-icon',
          'group-hover:p-0 group-hover:border group-hover:border-base-content',
          'group-focus-visible:p-0 group-focus-visible:border group-focus-visible:border-base-content',
        )}
      >
        <Icon name={icon} size={34} className={clsx('text-base-content/60')} />
      </span>
      <span className="text-center line-clamp-2">{children}</span>
      {category && (
        <span className="px-2 py-0.5 rounded-lg bg-base-300 text-center line-clamp-1 mt-auto">
          {category}
        </span>
      )}
    </ButtonOrLink>
  ) : (
    <ButtonOrLink
      className={clsx(
        className,
        'group inline-flex flex-col gap-1 rounded-2xl px-5.5 py-4 min-h-[10.75rem]',
        'shadow-card border border-base-300 bg-base-100',
        'transition hover:scale-[1.02] focus:scale-[1.02]',
      )}
      {...passThroughProps}
    >
      <div className="flex items-start gap-8">
        {category && (
          <span
            className={clsx(
              'px-3 py-1.25 text-h5 font-medium rounded-full border border-base-300 bg-base-200 line-clamp-1',
            )}
          >
            {category}
          </span>
        )}
        <span
          className={clsx(
            'flex-none flex justify-center items-center transition',
            'h-[4.25rem] w-[4.25rem] rounded-full p-0.5 ms-auto',
            'bg-base-200 border border-base-300 shadow-icon',
          )}
        >
          <Icon
            name={icon}
            size={34}
            className={clsx('text-base-content/60')}
          />
        </span>
      </div>
      <div className="text-left text-h2 font-medium line-clamp-2">
        {children}
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
