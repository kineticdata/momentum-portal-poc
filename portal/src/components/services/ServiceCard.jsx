import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

/**
 * Renders a card representing a Kientic service form, with a link to the form.
 *
 * @param {Object} form Kinetic form record.
 * @param {string} className
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the Link component.
 */
export const ServiceCard = ({ form, className, ...passThroughProps }) => {
  const location = useLocation();
  const icon = getAttributeValue(form, 'Icon', 'forms');

  return (
    <div
      className={clsx(
        'relative flex py-0.75 md:py-2.75 px-1 md:px-6 gap-3 items-center min-h-16 rounded-xl',
        'bg-base-100 shadow-card border border-transparent transition',
        'hover:border-text-content hover:bg-base-200 hover:shadow-card-hover',
        'focus-within:border-text-content focus-within:bg-base-200 focus-within:shadow-card-hover',
        className,
      )}
    >
      <div className="bg-base-200 border border-base-300 text-base-content/60 rounded-xl shadow-icon flex-none p-1.25 md:p-1.75">
        <Icon name={icon} />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <Link
          className="text-sm font-medium leading-4 line-clamp-1 after:absolute after:inset-0 outline-0"
          to={form.slug ? `/forms/${form.slug}` : undefined}
          state={{ backPath: location.pathname }}
          {...passThroughProps}
        >
          {form.name}
        </Link>
        <div className="text-xs text-base-content/60 line-clamp-2">
          {form.description}
        </div>
      </div>
    </div>
  );
};

ServiceCard.propTypes = { form: t.object, className: t.string };
