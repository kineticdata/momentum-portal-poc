import t from 'prop-types';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';

/**
 * Generates a Layout component for CoreForm.
 *
 * @param {JSX.FC} [Heading] Additional component(s) to
 *  render in the heading of the form layout.
 * @param {string} [backTo] Path that the back button should use.
 * @returns {function({form: Object, content: (JSX.Element|JSX.Element[])}): *}
 */
export const generateFormLayout = ({
  headingComponent: Heading,
  backTo,
} = {}) => {
  /**
   * Generate a FormLayout component to be used by the CoreForm component. The
   * props passed into this component are provided by CoreForm.
   *
   * @param {Object} form The Kinetic form record
   * @param {JSX.Element|JSX.Element[]} content The form content to render.
   */
  const FormLayout = ({ form, content }) => {
    const location = useLocation();
    const backPath = location.state?.backPath;
    const icon = getAttributeValue(form, 'Icon', 'forms');

    return (
      <div
        className={clsx(
          // Common styles
          'flex flex-col bg-primary-900 text-primary-300 shadow-card max-w-screen-xl self-center',
          // Mobile first styles
          'max-md:stretch-wide max-md:flex-auto max-md:w-stretch',
          // Non mobile styles
          'md:my-6 md:rounded-t-2.5xl md:rounded-b-3xl md:shadow-card md:w-full',
        )}
      >
        <div
          className={clsx(
            // Mobile first styles
            'p-6 py-4 flex-none flex flex-col items-center gap-3',
            // Non mobile styles
            'md:py-5',
          )}
        >
          <div className="self-stretch flex justify-between items-center gap-3">
            <span className="flex-1">
              {(backTo || backPath) && (
                <Button
                  variant="tertiary"
                  inverse
                  icon="arrow-left"
                  to={backTo || backPath}
                  aria-label="Back"
                />
              )}
            </span>
            <div className="bg-primary-100 border border-primary-400 text-primary-900 rounded-[10px] shadow-icon flex-none p-2.25">
              <Icon name={form ? icon : 'blank'} />
            </div>
            <span className="flex-1"></span>
          </div>
          <div className="max-w-screen-md text-base md:text-h3 font-semibold">
            {form?.name}
          </div>
          <div className="max-w-screen-md text-sm md:text-base line-clamp-2">
            {form?.description}
          </div>
          {form && Heading && (
            <div className="max-w-screen-md">
              <Heading />
            </div>
          )}
        </div>
        <div
          className={clsx(
            // Common styles
            'text-primary-900',
            // Mobile first styles
            'flex-auto bg-white shadow-card rounded-t-2.5xl',
            // Non mobile styles
            'md:rounded-2.5xl',
          )}
        >
          <div className="mx-auto p-6 md:p-10 w-full max-w-screen-lg">
            {content}
          </div>
        </div>
      </div>
    );
  };

  FormLayout.propTypes = {
    form: t.object,
    content: t.any,
  };

  return FormLayout;
};
