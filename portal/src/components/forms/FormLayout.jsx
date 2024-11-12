import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { getAttributeValue } from '../../helpers/records.js';
import { Button } from '../../atoms/Button.js';
import { Icon } from '../../atoms/Icon.jsx';

export const generateFormLayout =
  ({ headingComponent: Heading } = {}) =>
  ({ form, content }) => {
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
              {backPath && (
                <Button
                  link
                  variant="tertiary"
                  inverse
                  icon="arrow-left"
                  to={backPath}
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
