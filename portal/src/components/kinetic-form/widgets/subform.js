import { forwardRef, useCallback, useRef, useState } from 'react';
import t from 'prop-types';
import { CoreForm, generateKey, KineticLib } from '@kineticdata/react';
import { Button } from '../../../atoms/Button.jsx';
import { getChildSlots } from '../../../helpers/atoms.js';
import { Loading as Pending } from '../../states/Loading.jsx';
import { registerWidget, validateContainer, WidgetAPI } from './index.js';
import { callIfFn } from '../../../helpers/index.js';
import { Modal } from '../../../atoms/Modal.jsx';
import { toastError, toastSuccess } from '../../../helpers/toasts.js';

// Asynchronously import the global dependencies that are used in the embedded
// forms. Note that we deliberately do this as a const so that it should start
// immediately without making the initial application load wait, but the
// CoreForm component will wait for this to be loaded.
const globals = import('../globals.jsx');

const SubformLayout = ({
  inline,
  title,
  formFn,
  toasterId,
  destroy,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'SubformLayout',
    requiredSlots: ['content'],
    optionalSlots: ['save'],
  });

  return inline ? (
    <div className="flex flex-col items-stretch gap-5 w-full">
      {slots.content}
      {slots.save}
    </div>
  ) : (
    <Modal
      open={true}
      onOpenChange={({ open }) => !open && destroy()}
      title={title || (formFn && formFn.name()) || 'Loading...'}
      toasterId={toasterId}
    >
      <div slot="body">{slots.content}</div>
      <div slot="footer">{slots.save}</div>
    </Modal>
  );
};

SubformLayout.propTypes = {
  inline: t.bool,
  title: t.string,
  formFn: t.object,
  toasterId: t.string,
  destroy: t.func,
  children: t.node,
};

/**
 * @param {SubformWidgetConfig} props
 */
const SubformComponent = forwardRef(
  (
    {
      kappSlug,
      formSlug,
      submissionId,
      values: valuesParam,
      review,
      onLoad,
      onSave,
      onError,
      inline,
      modalTitle,
      saveLabel = 'Save',
      destroy,
    },
    ref,
  ) => {
    // State for tracking if subform was loaded and its api is ready
    const [ready, setReady] = useState(false);
    // Ref to store the kinetic form object
    const formFn = useRef(null);
    // Loaded callback to set ready state and formFn ref value
    const loaded = useCallback(
      form => {
        setReady(!!form);
        formFn.current = form;
        callIfFn(onLoad, null, [form, { close: destroy }]);
      },
      [onLoad, destroy],
    );
    // Error callback
    const error = useCallback(() => {
      callIfFn(onError, null, [{ close: destroy }]);
    }, [onError, destroy]);

    // API function for getting the kinetic form object for the subform
    const subform = () => {
      if (formFn.current) return formFn.current;
      console.log(
        "Subform Widget: The API function `form` isn't available until the form is fully loaded.",
      );
    };

    const [toasterId] = useState(!inline ? generateKey() : undefined);
    const toastApis = toasterId
      ? {
          toastSuccess: options => toastSuccess({ ...options, id: toasterId }),
          toastError: options => toastError({ ...options, id: toasterId }),
        }
      : {};

    return (
      <WidgetAPI ref={ref} api={{ subform, ...toastApis }}>
        <KineticLib globals={globals} locale="en">
          <SubformLayout
            inline={inline}
            title={modalTitle}
            formFn={formFn.current}
            toasterId={toasterId}
            destroy={destroy}
          >
            <CoreForm
              slot="content"
              submission={submissionId}
              kapp={kappSlug}
              form={formSlug}
              values={valuesParam}
              review={review}
              components={{ Pending }}
              onLoaded={loaded}
              onNotFound={error}
              onError={error}
            />
            {ready && onSave && (
              <Button
                slot="save"
                variant="primary"
                className="flex-1"
                onClick={() => onSave(subform(), { close: destroy })}
              >
                {saveLabel}
              </Button>
            )}
          </SubformLayout>
        </KineticLib>
      </WidgetAPI>
    );
  },
);

SubformComponent.propTypes = {
  kappSlug: t.string,
  formSlug: t.string,
  submissionId: t.string,
  values: t.object,
  review: t.bool,
  onLoad: t.func,
  onSave: t.func,
  onError: t.func,
  inline: t.bool,
  modalTitle: t.string,
  saveLabel: t.string,
  destroy: t.func,
};

/**
 * Function that initializes a Subform widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {MarkdownWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Subform.get` function.
 */
export const Subform = ({ container, config, id } = {}) => {
  if (validateContainer(container, 'Subform')) {
    return registerWidget(Subform, {
      container,
      Component: SubformComponent,
      props: { ...config },
      id,
    });
  }
};

/**
 * @typedef {Object} SubformWidgetConfig
 * @property {string} [kappSlug] The slug of the kapp in which the subform you
 *  want to render exists.
 * @property {string} [formSlug] The slug of the form you want to render.
 * @property {string} [submissionId] The submission id of the submission you
 *  want to render.
 * @property {Object} [values] Map of default field values to use for the form.
 * @property {boolean} [review] Should the form be rendered in review mode.
 * @property {Function} [onLoad] Function that's called when the subform is
 *  loaded.
 * @property {Function} [onSave] Function that's called when the save button of
 *  the widget is clicked. If omitted, the save button will not be rendered.
 * @property {Function} [onError] Function that's called when the subform fails
 *  to load.
 * @property {boolean} [inline] Should the form render inline instead of in a
 *  modal.
 * @property {string} [modalTitle] The title for the modal when the subform is
 *  rendered in a modal.
 * @property {string} [saveLabel] The label for the save button.
 */
