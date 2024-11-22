import { useSelector } from 'react-redux';
import { closeConfirm } from '../../helpers/confirm.js';
import { Modal } from '../../atoms/Modal.jsx';
import { Button } from '../../atoms/Button.jsx';
import { callIfFn } from '../../helpers/index.js';

/**
 * Component that should be rendered once at the root of the app, and renders a
 * confirmation modal when the `confirm` redux state contains options for the
 * modal.
 */
export const ConfirmationModal = () => {
  // Get the options for the confirmation modal from redux state
  const options = useSelector(state => state.confirm.options);

  // Handler for accepting the confirmation, which triggers the provided
  // accept callback and closes the confirmation modal.
  const accept = () => {
    callIfFn(options?.accept);
    closeConfirm();
  };

  // Handler for canceling the confirmation, which triggers the provided
  // cancel callback and closes the confirmation modal.
  const cancel = () => {
    callIfFn(options?.cancel);
    closeConfirm();
  };

  return (
    <Modal
      // if options don't exist, the modal shouldn't be shown
      open={!!options}
      // When the modal gets closed, trigger the cancel handler
      onOpenChange={({ open }) => !open && cancel()}
      title={options?.title || 'Are you sure you want to continue?'}
    >
      {options?.description && (
        <div slot="description">{options?.description}</div>
      )}
      <div slot="footer">
        <Button onClick={accept}>{options?.acceptLabel || 'Continue'}</Button>
        <Button variant="tertiary" onClick={cancel}>
          {options?.cancelLabel || 'Cancel'}
        </Button>
      </div>
    </Modal>
  );
};
