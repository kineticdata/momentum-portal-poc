import t from 'prop-types';
import { ark } from '@ark-ui/react/factory';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { getChildSlots } from '../helpers/atoms.js';
import { Icon } from './Icon.jsx';

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
 * @param {string} props.title The title text for the modal.
 * @param {boolean} [props.closeOnEscape=true] Should the modal close when the
 *  escape key is pressed.
 * @param {boolean} [props.closeOnInteractOutside=true] Should the modal close
 *  when the user interacts with the area outside the modal.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  available slots in the modal. Available slots are:
 *  - trigger: Component that toggles the modal open state when interacted with.
 *  - description: Inner content of the modal that is syntactically a
 *      descriptor of the modal content.
 *  - body: Main content of the modal if the description isn't enough.
 *  - footer: Footer content of the modal.
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  closeOnEscape,
  closeOnInteractOutside,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'Modal',
    requiredSlots: [],
    optionalSlots: ['trigger', 'description', 'body', 'footer'],
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnInteractOutside}
    >
      {slots.trigger && (
        <Dialog.Trigger asChild className="btn">
          {slots.trigger}
        </Dialog.Trigger>
      )}
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black bg-opacity-20" />
        <Dialog.Positioner className="fixed inset-0 flex justify-center items-center">
          <Dialog.Content className="p-6 bg-white rounded shadow-lg">
            <div className="flex justify-between gap-2 mb-6">
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger>
                <Icon name="x" />
              </Dialog.CloseTrigger>
            </div>
            {slots.description && (
              <Dialog.Description asChild>
                {slots.description}
              </Dialog.Description>
            )}
            {slots.body && <ark.div asChild>{slots.body}</ark.div>}
            {slots.footer && (
              <ark.div
                asChild
                className="flex justify-start flex-row-reverse gap-2 mt-6"
              >
                {slots.footer}
              </ark.div>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

Modal.propTypes = {
  open: t.bool,
  onOpenChange: t.func,
  closeOnEscape: t.bool,
  closeOnInteractOutside: t.bool,
  title: t.string.isRequired,
  children: t.node,
};
