import { useSelector } from 'react-redux';
import { ServicesPanel } from '../services/ServicesPanel.jsx';
import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

export const ShortcutsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <div className="relative md:h-40 overflow-visible">
      <div
        className="md:w-[calc(100%-3rem)] xl:w-[calc(100%-1rem)] md:h-full md:bg-white md:rounded-2xl md:p-4 md:pr-28"
        style={{
          maskImage: !mobile
            ? 'radial-gradient(circle at 100% 5.5rem, transparent 6.25rem, white 6.3125rem)'
            : 'none',
        }}
      ></div>

      {!mobile && (
        <ServicesPanel>
          <button
            type="button"
            className={clsx(
              'group inline-flex flex-col items-center gap-1 outline-0 font-semibold',
            )}
          >
            <span
              className={clsx(
                'absolute md:-right-8 xl:-right-16 top-2',
                'flex-none flex justify-center items-center transition',
                'h-40 w-40 rounded-full p-0.5',
                'bg-primary-900 bg-glassmorphism-border [--glassmorphism-angle:145deg]',
                'group-hover:bg-gray-500',
                'group-focus-visible:bg-secondary-400 data-[state=open]:bg-secondary-400',
              )}
            >
              <span
                className={clsx(
                  'flex flex-col justify-center items-center gap-2',
                  'h-full w-full rounded-full transition',
                  'bg-primary-900 text-primary-100',
                  'group-hover:bg-gray-500 group-hover:text-white',
                  'group-focus-visible:bg-secondary-400 group-focus-visible:text-primary-900',
                )}
              >
                <Icon name="file-plus" size={48} />
                <span>New Request</span>
              </span>
            </span>
          </button>
        </ServicesPanel>
      )}
    </div>
  );
};
