import t from 'prop-types';
import clsx from 'clsx';
import { ark } from '@ark-ui/react/factory';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { getChildSlots } from '../helpers/atoms.js';
import { CloseButton } from './Button.jsx';
import { Toaster } from './Toaster.jsx';

/**
 * A modal.
 *
 * @param {Object} props Props object
 * @param {boolean} [props.open] Is the modal open.
 *  When provided, the component will be set to controlled mode, and this flag
 *  will be used to determine if it's open or not. If omitted, the component
 *  will be set to uncontrolled mode.
 * @param {Function} [props.onOpenChange] If the component is controlled, this
 *  function is triggered when the open state should be changed, and it should
 *  modify the `open` prop. If the component is uncontrolled, this function is
 *  a callback that is triggered whenever the open state changes.
 *  The function is passed one parameter, which is an object with an `open`
 *  property defining what the new state of the component is or should be.
 * @param {Function} [props.onExitComplete] Function to call after the modal
 *  finishes closing.
 * @param {string} props.title The title text for the modal.
 * @param {('sm'|'md'|'lg'|'xl')} [size=sm] The size of the modal
 * @param {boolean} [props.closeOnEscape=true] Should the modal close when the
 *  escape key is pressed.
 * @param {boolean} [props.closeOnInteractOutside=true] Should the modal close
 *  when the user interacts with the area outside the modal.
 * @param {string} [props.toasterId] The id for a Toaster component that should
 *  be rendered inside the modal to allow for toasts that can be interacted
 *  with without the modal getting closed.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  available slots in the modal. Available slots are:
 *  - trigger: Component that toggles the modal open state when interacted with.
 *  - title: Component to render in the header instead of the title.
 *  - description: Inner content of the modal that is syntactically a
 *      descriptor of the modal content.
 *  - body: Main content of the modal if the description isn't enough.
 *  - footer: Footer content of the modal.
 */
export const Modal = ({
  open,
  onOpenChange,
  onExitComplete,
  title,
  size = 'sm',
  closeOnEscape,
  closeOnInteractOutside,
  toasterId,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'Modal',
    requiredSlots: [],
    optionalSlots: ['trigger', 'title', 'description', 'body', 'footer'],
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnInteractOutside}
      lazyMount
      unmountOnExit
    >
      {slots.trigger && (
        <Dialog.Trigger asChild>{slots.trigger}</Dialog.Trigger>
      )}
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black bg-opacity-20" />
        <Dialog.Positioner className="fixed inset-0 flex flex-col justify-around items-center">
          <Dialog.Content
            className={clsx(
              // Common styles
              'data-[state=open]:flex flex-col items-stretch py-3 bg-white',
              'max-h-[calc(100vh-3rem)] rounded-[40px] shadow-lg',
              // Mobile first styles
              'max-md:w-screen',
              // Non mobile styles
              'md:max-w-[calc(100vw-3rem)]',
              {
                'md:w-screen-sm': size === 'sm',
                'md:w-screen-md': size === 'md',
                'md:w-screen-lg': size === 'lg',
                'md:w-screen': size === 'xl',
              },
            )}
          >
            <div className="flex justify-between items-center gap-2 py-3 px-6">
              <Dialog.Title className="flex-auto" asChild={!!slots.title}>
                {slots.title || title}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </div>
            {slots.description && (
              <Dialog.Description
                asChild
                className="overflow-auto scrollbar-white py-3 px-6"
              >
                {slots.description}
              </Dialog.Description>
            )}
            {slots.body && (
              <ark.div
                asChild
                className="overflow-auto scrollbar-white py-3 px-6"
              >
                {slots.body}
              </ark.div>
            )}
            {slots.footer && (
              <ark.div
                asChild
                className="flex justify-start flex-row-reverse gap-2 py-3 px-6"
              >
                {slots.footer}
              </ark.div>
            )}
            {toasterId && <Toaster id={toasterId} />}
          </Dialog.Content>

          {/* This div is used to position the modal higher up on the screen */}
          <div className="md:-mt-6" />
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

Modal.propTypes = {
  open: t.bool,
  onOpenChange: t.func,
  onExitComplete: t.func,
  closeOnEscape: t.bool,
  closeOnInteractOutside: t.bool,
  title: t.string.isRequired,
  size: t.string,
  toasterId: t.string,
  children: t.node,
};
