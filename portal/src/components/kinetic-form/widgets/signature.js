import { useState, forwardRef } from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import { Modal } from '../../../atoms/Modal.jsx';
import { SignaturePad } from '@ark-ui/react/signature-pad';
import { Icon } from '../../../atoms/Icon.jsx';
import {
  WidgetAPI,
  registerWidget,
  validateContainer,
  validateField,
} from './index.js';
import { getCsrfToken } from '@kineticdata/react';
import { toastError } from '../../../helpers/toasts.js';

/**
 * @param {Object} props.field Kinetic field object
 * @param {SignatureWidgetConfig} props
 */
const SignatureComponent = forwardRef(
  (
    {
      field,
      modalTitle = 'Sign your form',
      signaturePadLabel = 'Signature',
      agreementText = 'I understand this is a legal representation of my signature.',
      savedButtonLabel = 'Save',
      savedFileName = 'signature_widget',
      buttonLabel = 'Signature',
      clearButtonLabel = 'Clear',
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [savedSignature, setSavedSignature] = useState(() =>
      field.value()?.[0]
        ? `${field.form().fileDownloadPath(field.name())}/0/${encodeURIComponent(field.value()[0].name)}`
        : null,
    );

    // Function to get the value
    const getValue = () => {
      return field.value();
    };

    // Function to reset the value externally
    const reset = () => {
      setImageUrl('');
      setSavedSignature('');
      field.value([]);
    };

    const dataUrlToBlob = dataUrl => {
      return fetch(dataUrl)
        .then(response => response.blob())
        .catch(error => console.error('Error converting image to blob', error));
    };

    const onSave = async () => {
      let data = new FormData();
      data.append(
        'files',
        await dataUrlToBlob(imageUrl),
        `${savedFileName}.png`,
      );

      fetch(field.form().fileUploadPath(), {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: data,
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error('Failed to save signature.');
          }

          const responseData = await response.json();
          field.value(responseData);
          setSavedSignature(imageUrl);
          setOpen(false);
        })
        .catch(() => {
          toastError({
            title: 'Failed to save signature.',
          });
        });
    };

    const onExitComplete = () => {
      setImageUrl('');
    };

    return (
      <WidgetAPI
        ref={ref}
        api={{
          getValue,
          reset,
        }}
      >
        <div className={clsx('flex flex-col')}>
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-[271px] h-[59px] bg-white border border-primary-400 rounded-2.5xl hover:bg-primary-100 flex items-center justify-center focus-visible:bg-primary-100 outline-0"
            >
              {savedSignature ? (
                <img
                  src={savedSignature}
                  alt="signature"
                  className="max-h-full max-w-full object-contain rounded-2.5xl"
                />
              ) : (
                <span className="flex items-center gap-2">
                  {buttonLabel} <Icon name="writing" aria-label="signature" />
                </span>
              )}
            </button>
            {savedSignature && (
              <button className="flex ml-6 font-semibold" onClick={reset}>
                {clearButtonLabel}
              </button>
            )}
          </div>
        </div>
        <Modal
          title={modalTitle}
          open={open}
          onOpenChange={({ open }) => setOpen(open)}
          onExitComplete={onExitComplete}
          size="sm"
        >
          <div slot="body">
            <SignaturePad.Root
              onDrawEnd={details =>
                details.getDataUrl('image/png').then(url => setImageUrl(url))
              }
            >
              <div className="mb-2 font-semibold text-gray-900">
                <SignaturePad.Label>{signaturePadLabel}</SignaturePad.Label>
              </div>
              <SignaturePad.Control
                className={clsx(
                  'border border-primary-400 bg-gray-100 relative rounded-2.5xl transition-all',
                  'hover:bg-primary-100',
                  'focus-within:ring focus-within:ring-secondary-400',
                )}
              >
                <SignaturePad.Segment />
                <SignaturePad.Guide
                  className={clsx(
                    'h-[200px] relative rounded-2.5xl',
                    'border-primary-400',
                  )}
                >
                  <SignaturePad.ClearTrigger
                    className="absolute top-2 right-2 mr-3 mt-3"
                    onClick={reset}
                  >
                    <Icon name="refresh" aria-label="reset"></Icon>
                  </SignaturePad.ClearTrigger>
                  <div className="flex justify-between items-center absolute bottom-4 left-5 right-6 border-t-2 border-gray-400"></div>
                </SignaturePad.Guide>
              </SignaturePad.Control>
            </SignaturePad.Root>
          </div>
          <div slot="footer" className="flex flex-col items-center">
            <p className="text-center text-small text-gray-900">
              {agreementText}
            </p>
            <button
              type="button"
              onClick={onSave}
              disabled={!imageUrl}
              className={clsx(
                'w-full rounded-2.5xl bg-secondary-400 button-text py-2 font-semibold border border-primary-500',
                {
                  'disabled:bg-gray-200 text-gray-900 font-medium': !imageUrl,
                },
              )}
            >
              {savedButtonLabel}
            </button>
          </div>
        </Modal>
      </WidgetAPI>
    );
  },
);

SignatureComponent.propTypes = {
  field: t.object.isRequired,
  modalTitle: t.string,
  signaturePadLabel: t.string,
  agreementText: t.string,
  savedButtonLabel: t.string,
  savedFileName: t.string,
  buttonLabel: t.string,
  clearButtonLabel: t.string,
};

/**
 * Function that initializes the Signature widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} field Kinetic text field with 2 or more rows.
 * @param {SignatureWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Signature.get` function.
 */
export const Signature = ({ container, field, config, id } = {}) => {
  if (
    validateContainer(container, 'Signature') &&
    validateField(field, 'attachment', 'Signature')
  ) {
    return registerWidget(Signature, {
      container,
      Component: SignatureComponent,
      props: { ...config, field },
      id,
    });
  }
};

/**
 * @typedef {Object} SignatureWidgetConfig
 * @property {string} [modalTitle] The title displayed at the top of the modal.
 * @property {string} [signaturePadLabel] The label displayed above the signature pad.
 * @property {string} [agreementText] The text displayed to indicate the agreement for the signature.
 * @property {string} [savedButtonLabel] The label for the "Save" button in the modal.
 * @property {string} [savedFileName] The name of the file saved after the signature is completed.
 * @property {string} [buttonLabel] The label for the signature field.
 * @property {string} [clearButtonLabel] The label for the "Clear" button next to the signature field.
 */
