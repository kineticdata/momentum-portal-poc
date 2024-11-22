import { useEffect } from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import { Toast, Toaster as ArkToaster } from '@ark-ui/react/toast';
import { CloseButton } from './Button.jsx';
import { Icon } from './Icon.jsx';
import { DEFAULT_ID, getToaster, initToaster } from '../helpers/toasts.js';

/**
 * Defines a container for rendering toasts.
 *
 * @param {string} [id] An ID to uniquely identify this container. Use this if
 *  you want to render multiple containers.
 * @param {string} [placement] Position of the toasts.
 * @param {string} [className] Optional classes to add to the toast container.
 *  If you want to render a toast container inside another container, use the
 *  `!absolute` class.
 */
export const Toaster = ({
  id = DEFAULT_ID,
  placement = 'top-middle',
  className,
}) => {
  useEffect(() => {
    initToaster({
      id,
      placement,
      overlap: true,
      gap: 12,
      offsets: {
        top: 'var(--toaster-top-offset)',
        left: 'var(--toaster-offset)',
        right: 'var(--toaster-offset)',
        bottom: 'var(--toaster-bottom-offset)',
      },
    });
    return () => {};
  }, [id, placement]);

  const toaster = getToaster(id);

  return (
    toaster && (
      <ArkToaster toaster={toaster} className={className}>
        {toast => (
          <Toast.Root
            key={toast.id}
            className={clsx(
              'flex flex-col items-stretch gap-3 pl-5 pr-1.5 py-3',
              'rounded-tl-2.5xl rounded-br-2.5xl shadow-card overflow-hidden',
              'min-w-80 max-w-[calc(100vw-3rem)] md:max-w-screen-sm',
              {
                'bg-primary-900 text-primary-100': toast.type !== 'error',
                'bg-warning-500 text-white': toast.type === 'error',
              },
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                name={clsx({
                  'circle-check-filled': toast.type !== 'error',
                  'exclamation-circle-filled': toast.type === 'error',
                })}
                className={clsx('flex-none', {
                  'text-success-400': toast.type !== 'error',
                  'text-warning-200': toast.type === 'error',
                })}
              />
              <Toast.Title className="flex-auto font-medium">
                {toast.title}
              </Toast.Title>
              <Toast.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  className="flex-none ml-auto -my-1.5"
                  inverse
                />
              </Toast.CloseTrigger>
            </div>
            {toast.description && (
              <Toast.Description className="">
                {toast.description}
              </Toast.Description>
            )}
          </Toast.Root>
        )}
      </ArkToaster>
    )
  );
};

Toaster.propTypes = {
  id: t.string,
  placement: t.string,
  className: t.string,
};
