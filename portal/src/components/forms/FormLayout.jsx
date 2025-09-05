import t from 'prop-types';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';

/**
 * Generates a Layout component for CoreForm.
 *
 * @param {Object} [options]
 * @param {React.FC} [options.actionComponent] Additional component to render
 *  in the top right corner of the heading of the form layout.
 * @param {React.FC} [options.headingComponent] Additional component(s) to
 *  render in the heading of the form layout.
 * @param {string} [options.backTo] Path that the back button should use.
 * @returns {function({form: Object, content: (JSX.Element|JSX.Element[])}): *}
 */
export const generateFormLayout = ({
  actionComponent: Action,
  headingComponent: Heading,
  backTo,
} = {}) => {
  /**
   * Generate a FormLayout component to be used by the CoreForm component. The
   * props passed into this component are provided by CoreForm.
   *
   * @param {Object} options
   * @param {Object} options.form The Kinetic form record
   * @param {Object} options.submission The Kinetic submission record
   * @param {JSX.Element|JSX.Element[]} options.content The form content to
   *  render.
   */
  const FormLayout = ({
    form,
    submission,
    content,
    reviewPaginationControl,
  }) => {
    const location = useLocation();
    const backPath = location.state?.backPath;
    const icon = getAttributeValue(form, 'Icon', 'forms');

    return (
      <div className="max-w-screen-lg mx-auto my-5">
        <div className={clsx('rounded-box border border-base-300')}>
          <div className="p-6 l-h-start-center gap-3">
            {(backTo || backPath) && (
              <Button
                variant="tertiary"
                icon="arrow-left"
                to={backTo || backPath}
                aria-label="Back"
                className="flex-none"
              />
            )}
            <div className="flex-none l-h-center-center p-3 bg-base-300 rounded-sm">
              <Icon name={form ? icon : 'blank'} />
            </div>
            <span className="text-primary uppercase text-xl">{form?.name}</span>
            {Action && (
              <span className="flex-none ms-auto">
                <Action
                  form={form}
                  submission={submission}
                  backTo={backTo || backPath}
                />
              </span>
            )}
          </div>
          {form?.description && (
            <div className="px-6 mb-6 uppercase line-clamp-2">
              {form?.description}
            </div>
          )}
          {form && Heading && (
            <div className="px-6 mb-6">
              <Heading
                form={form}
                submission={submission}
                backTo={backTo || backPath}
              />
            </div>
          )}
          <div className={clsx('text-base-content flex-auto p-6')}>
            {content}
            {reviewPaginationControl}
          </div>
        </div>
      </div>
    );
  };

  FormLayout.propTypes = {
    form: t.object,
    submission: t.object,
    content: t.any,
  };

  return FormLayout;
};
