import {
  clearToasts,
  toastError,
  toastSuccess,
} from '../../../helpers/toasts.js';

export const Toast = () =>
  console.log(
    'Toast Widget: Use `Toast.success` and `Toast.error` to trigger toasts.',
  );

Object.assign(Toast, {
  success: toastSuccess,
  error: toastError,
  clear: clearToasts,
});
