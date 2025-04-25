import { useState, forwardRef, useRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import { Modal } from '../../../atoms/Modal.jsx';
import { SignaturePad } from '@ark-ui/react/signature-pad';
import { Tabs } from '@ark-ui/react/tabs';
import { Icon } from '../../../atoms/Icon.jsx';
import {
  WidgetAPI,
  registerWidget,
  validateContainer,
  validateField,
} from './index.js';
import { getCsrfToken } from '@kineticdata/react';
import { toastError } from '../../../helpers/toasts.js';
import { Provider, useSelector } from 'react-redux';
import { store } from '../../../redux.js';
import radioChecked from '../../../assets/styles/icons/radio-checked.svg';
import radioDisabled from '../../../assets/styles/icons/radio-checked_disabled.svg';

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
      fullNameLabel = 'Full Name*',
      agreementText = 'I understand this is a legal representation of my signature.',
      savedButtonLabel = 'Save',
      savedFileName = 'signature_widget',
      buttonLabel = 'Signature',
      clearButtonLabel = 'Clear',
    },
    ref,
  ) => {
    const canvasRef = useRef(null);
    const profile = useSelector(state => state.app.profile);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('draw');
    const [imageUrl, setImageUrl] = useState('');
    const [fullName, setFullName] = useState(
      profile.displayName || 'Full Name',
    );
    const [selectedStyle, setSelectedStyle] = useState('');
    const [savedSignature, setSavedSignature] = useState(() =>
      field.value()?.[0]
        ? `${field.form().fileDownloadPath(field.name())}/0/${encodeURIComponent(field.value()[0].name)}`
        : null,
    );

    const signatureFonts = [
      { font: 'Waiting for the Sunrise' },
      { font: 'Mynerve' },
      { font: 'Grechen Fuemen' },
      { font: 'Condiment' },
      { font: 'Nothing You Could Do' },
      { font: 'Comforter Brush' },
    ];

    const tabClasses = clsx(
      'flex items-center justify-center gap-1 px-3 py-2 h-[2.25rem] w-[6rem] rounded-2.5xl',
    );

    // Function to get the value
    const getValue = useCallback(() => field.value(), [field]);

    // Function to reset the value externally
    const reset = useCallback(() => {
      setImageUrl('');
      setSavedSignature('');
      field.value([]);
    }, [field]);

    const generateSignatureImage = () => {
      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext('2d');

      canvas.width = 500;
      canvas.height = 100;

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.fillStyle = '#11005E';
      canvasContext.textAlign = 'center';
      canvasContext.textBaseline = 'middle';

      let fontSize = 48;
      canvasContext.font = `${fontSize}px ${selectedStyle}`;

      let textWidth = canvasContext.measureText(fullName.toUpperCase()).width;

      // Adjusts the font size to ensure the text fits within the canvas width
      while (textWidth > canvas.width - 20 && fontSize > 10) {
        fontSize -= 2;
        canvasContext.font = `${fontSize}px ${selectedStyle}`;
        textWidth = canvasContext.measureText(fullName.toUpperCase()).width;
      }

      canvasContext.fillText(
        fullName.toUpperCase(),
        canvas.width / 2,
        canvas.height / 2,
      );

      return canvas.toDataURL('image/png');
    };

    const dataUrlToBlob = dataUrl => {
      return fetch(dataUrl)
        .then(response => response.blob())
        .catch(error => console.error('Error converting image to blob', error));
    };

    const onSave = async () => {
      let signatureImageUrl =
        activeTab === 'draw' ? imageUrl : generateSignatureImage();

      let data = new FormData();
      data.append(
        'files',
        await dataUrlToBlob(signatureImageUrl),
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
          setSavedSignature(signatureImageUrl);
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

    const isSaveDisabled =
      (activeTab === 'draw' && !imageUrl) ||
      (activeTab === 'type' && (!selectedStyle || !fullName));

    // Define API ref
    const api = useRef({ getValue, reset });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, { getValue, reset });
    }, [getValue, reset]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <div className={clsx('flex flex-col')}>
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-[17rem] h-[3.5rem] bg-white border border-primary-400 rounded-2.5xl hover:bg-primary-100 flex items-center justify-center focus-visible:bg-primary-100 outline-0"
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
              <button className="ml-6 font-semibold" onClick={reset}>
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
            <Tabs.Root
              value={activeTab}
              onValueChange={tab => setActiveTab(tab.value)}
            >
              <Tabs.List className="justify-center flex p-2 bg-primary-100 rounded-[3.75rem] w-[16rem] gap-8 mb-6">
                <Tabs.Trigger
                  value="draw"
                  className={clsx(
                    tabClasses,
                    activeTab === 'draw'
                      ? 'bg-primary-900 text-primary-100'
                      : 'bg-primary-100 text-grey-900',
                  )}
                >
                  <Icon name="writing" aria-label="draw"></Icon>
                  Draw
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="type"
                  className={clsx(
                    tabClasses,
                    activeTab === 'type'
                      ? 'bg-primary-900 text-primary-100'
                      : 'bg-primary-100 text-grey-900',
                  )}
                >
                  <Icon name="keyboard" aria-label="keyboard"></Icon>
                  Type
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="draw">
                <SignaturePad.Root
                  onDrawEnd={details =>
                    details
                      .getDataUrl('image/png')
                      .then(url => setImageUrl(url))
                  }
                >
                  <div className="mb-2 font-semibold text-gray-900">
                    <SignaturePad.Label>{signaturePadLabel}</SignaturePad.Label>
                  </div>
                  <SignaturePad.Control
                    className={clsx(
                      'border border-primary-400 bg-gray-100 relative rounded-2.5xl transition-all',
                      'hover:bg-primary-100',
                      'focus-within:ring-3 focus-within:ring-secondary-400',
                    )}
                  >
                    <SignaturePad.Segment />
                    <SignaturePad.Guide
                      className={clsx(
                        'h-[12.5rem] relative rounded-2.5xl',
                        'border-primary-400',
                      )}
                    >
                      <SignaturePad.ClearTrigger
                        className="absolute top-2 right-2 mr-3 mt-3"
                        onClick={reset}
                      >
                        <Icon name="refresh" aria-label="reset"></Icon>
                      </SignaturePad.ClearTrigger>
                      <div className="flex justify-between items-center absolute bottom-4 left-5 right-6 border-t-2 border-gray-200"></div>
                    </SignaturePad.Guide>
                  </SignaturePad.Control>
                </SignaturePad.Root>
              </Tabs.Content>
              <Tabs.Content value="type">
                <div className="mb-4">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    {fullNameLabel}
                  </label>
                  <div className="field w-full">
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="block px-5 md:px-6 py-2.75 md:py-2.25 max-md:text-sm border rounded-2.5xl outline-0 w-full font-semibold
               text-primary-900 bg-white border-primary-400
               hover:bg-primary-100 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-secondary-400
               disabled:text-gray-900 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <hr className="mb-4 mt-6 border-primary-400" />
                <div className="grid grid-cols-2 gap-4 radio-btn">
                  {signatureFonts.map(style => (
                    <label
                      key={style.font}
                      className="flex items-center justify-between border rounded-2.5xl p-4 w-[18rem] h-16 cursor-pointer transition-all
             text-primary-900 bg-white border-primary-400 hover:bg-primary-100
             focus-within:bg-white focus-within:ring-3 focus-within:ring-secondary-400
             overflow-wrap-anywhere disabled:text-gray-900 disabled:bg-gray-100"
                      onClick={() => setSelectedStyle(style.font)}
                    >
                      <span
                        className="text-2xl text-primary-900 uppercase"
                        style={{
                          fontFamily: style.font,
                          display: 'inline-block',
                          maxWidth: '12.5rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {fullName}
                      </span>

                      <input
                        type="radio"
                        value={style.font}
                        checked={selectedStyle === style.font}
                        onChange={() => setSelectedStyle(style.font)}
                        className={clsx(
                          'flex-none appearance-none w-5 h-5 border-2 border-primary-400 bg-secondary-400 outline-0 bg-center bg-no-repeat rounded-full bg-[length:0.75rem]',
                          `checked:radio-checked-bg`,
                          `disabled:checked:radio-disabled-bg`,
                        )}
                      />
                    </label>
                  ))}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
          <div slot="footer">
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="text-center text-small text-gray-900">
                {agreementText}
              </p>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaveDisabled}
                className={clsx(
                  'w-full rounded-2.5xl bg-secondary-400 button-text py-2 font-semibold border border-primary-500',
                  {
                    'disabled:bg-gray-200 text-gray-900 font-medium': !imageUrl,
                  },
                )}
              >
                {savedButtonLabel}
              </button>
              <canvas
                ref={canvasRef}
                id="signature-canvas"
                style={{ display: 'none' }}
              ></canvas>
            </div>
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
  fullNameLabel: t.string,
  agreementText: t.string,
  savedButtonLabel: t.string,
  savedFileName: t.string,
  clearButtonLabel: t.string,
};

const SignatureProvider = forwardRef((props, ref) => (
  <Provider store={store}>
    <SignatureComponent {...props} ref={ref} />
  </Provider>
));

/**
 * Function that initializes the Signature widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} field The Kinetic field object used to store the value of the signature.
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
      Component: SignatureProvider,
      props: { ...config, field },
      id,
    });
  }
  return Promise.reject(
    'The Signature widget parameters are invalid. See the console for more details.',
  );
};

/**
 * @typedef {Object} SignatureWidgetConfig
 * @property {string} [modalTitle] The title displayed at the top of the modal.
 * @property {string} [signaturePadLabel] The label displayed above the signature pad.
 * @property {string} [fullNameLabel] The label displayed above the signature type styles.
 * @property {string} [agreementText] The text displayed to indicate the agreement for the signature.
 * @property {string} [savedButtonLabel] The label for the "Save" button in the modal.
 * @property {string} [savedFileName] The name of the file saved after the signature is completed.
 * @property {string} [buttonLabel] The label for the signature field.
 * @property {string} [clearButtonLabel] The label for the "Clear" button next to the signature field.
 */
