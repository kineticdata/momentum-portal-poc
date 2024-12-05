import { forwardRef, useRef, useState } from 'react';
import t from 'prop-types';
import { Editor, Viewer } from '@toast-ui/react-editor';
import clsx from 'clsx';
import {
  registerWidget,
  validateContainer,
  validateField,
  WidgetAPI,
} from './index.js';

const MarkdownComponent = forwardRef(
  ({ className, disabled, field, editorProps }, ref) => {
    const editorRef = useRef();

    // Function to get the value from the Kinetic field
    const getValue = () => field.value();
    // Function to update the value externally
    const setValue = v => editorRef.current?.getInstance().setMarkdown(v);

    // State for disabled state of the editor
    const [isDisabled, setIsDisabled] = useState(
      disabled ?? field.form().reviewMode(),
    );

    // Change handler fore the editor to have it update the Kinetic field
    const handleChange = () => {
      field.value(editorRef.current.getInstance().getMarkdown());
    };

    return (
      <WidgetAPI
        ref={ref}
        api={{
          getValue,
          setValue,
          enable: () => setIsDisabled(false),
          disable: () => setIsDisabled(true),
        }}
      >
        <div
          className={clsx(className, 'w-full', {
            'markdown-editor': !isDisabled,
            'markdown-viewer': !!isDisabled,
          })}
        >
          {!isDisabled ? (
            <Editor
              height="auto"
              initialEditType="wysiwyg"
              {...editorProps}
              ref={editorRef}
              initialValue={getValue() || ''}
              onChange={handleChange}
            />
          ) : (
            <Viewer
              height="auto"
              linkAttribute={{
                target: '_blank',
                contenteditable: 'false',
                rel: 'noopener noreferrer',
              }}
              initialValue={getValue() || ''}
            />
          )}
        </div>
      </WidgetAPI>
    );
  },
);

MarkdownComponent.propTypes = {
  className: t.string,
  disabled: t.bool,
  field: t.object.isRequired,
  editorProps: t.object,
};

/**
 * Additional validations to be performed on the parameters of this widget.
 */
const validateOptions = field => {
  let valid = true;

  // Field must be a text field with 2+ rows so it's a textarea to properly
  // save the whitespace of markdown
  if (field?.element()?.[0]?.tagName !== 'TEXTAREA') {
    console.error(
      'Markdown Widget Error: The field parameter must be a Kinetic field of type "text" with 2 or more rows.',
    );
    valid = false;
  }

  return valid;
};

/**
 * Function that initializes a Markdown widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} field Kinetic text field with 2 or more rows.
 * @param {Object} options
 * @param {string} options.className Classes to add tyo the widget wrapper.
 * @param {boolean} options.disabled Should the markdown editor be disabled.
 *  If omitted, will use the reviewMode of the form to determine.
 * @param {Object} options.editorProps Object of props to pass through to the
 *  editor component. See the @toast-ui/react-editor Editor component for valid
 *  options.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Markdown.get` function.
 */
export const Markdown = ({ container, field, options, id } = {}) => {
  if (
    validateContainer(container, 'Markdown') &&
    validateField(field, 'text', 'Markdown') &&
    validateOptions(field, options)
  ) {
    return registerWidget(Markdown, {
      container,
      Component: MarkdownComponent,
      props: { ...options, field },
      id,
    });
  }
};
