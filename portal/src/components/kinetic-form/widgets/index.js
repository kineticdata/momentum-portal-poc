/**
 * Widgets are small React apps that can be rendered inside Kinetic forms to
 * perform specific functions, such as implementing a Search field or showing
 * a Markdown editor. These are standalone React applications and have no
 * connection to the main front end app.
 *
 * When a Kinetic form is unmounted, these widgets are removed from the DOM,
 * but they also need to be properly unmounted to prevent orphaned React apps
 * from taking up memory. The `registerWidget` function below handles tracking
 * instances of these widgets so they can be properly cleaned up.
 *
 * The widgets are exposed to Kinetic forms via the `bundle.widgets` global
 * variable.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { generateKey } from '@kineticdata/react';

import { Markdown } from './markdown.js';
import { Search } from './search.js';
import { Signature } from './signature.js';

// Defines a map of available widgets
const AVAILABLE_WIDGETS = { Markdown, Search, Signature };

// Ensure the bundle global object exists
const bundle = window.bundle ?? {};
// Create the widgets namespace if it doesn't exist
bundle.widgets ??= {};

// Assign widgets to the namespace, while adding some static properties to each
// widget function that will be used in the maintenance of the widget instances
Object.assign(
  bundle.widgets,
  Object.fromEntries(
    Object.entries(AVAILABLE_WIDGETS).map(([name, widget]) => [
      name,
      Object.assign(widget, {
        // Add a map to store active instances of this widget's API
        instances: {},
        // Add a function to get an instance of this widget's API via an ID
        get(id) {
          return this.instances[id];
        },
      }),
    ]),
  ),
);

// Create a registry for tracking widget instances
const registry = {};

/**
 * Registers an instance of a widget to help facilitate cleanup.
 *
 * @param {Function} Widget The function that defines the widget. Used
 *  for accessing static properties of the function.
 * @param {Object} options
 * @param {HTMLElement} options.container The HTML Element within which the
 *  widget should be rendered rendered.
 * @param {React.FC} options.Component The React component that implements the
 *  widget functionality.
 * @param {Object} options.props The props that should be passed into the
 *  component.
 * @param {string} [options.id] Unique id for referencing this instance of the
 *  widget.
 * @returns {Object} Object of APi functions to interact with the widget. Some
 *  API functions are added to this API object after the asynchronous render of
 *  the component, and may not be immediately available.
 */
export const registerWidget = (Widget, { container, Component, props, id }) => {
  // Define a mutable object to store the React root and API for the widget,
  // which will both be updated later in the registration process
  const state = { root: undefined, api: { container: () => container } };

  // Get the key from the container to check if it was already registered, as
  // each container can only have one widget rendered in it
  let key = container.getAttribute('data-widget-key');

  // If the key exists, then we just return the APi for the given id or key
  if (key) return Widget?.instances?.[id || key];

  // If the key doesn't exist, generate a random key
  key = generateKey();
  // Set the key into the DOM
  container.setAttribute('data-widget-key', key);

  // If the registry cleanup process hasn't been initialized yet, do so now
  if (!registry.init) {
    // Create a MutationObserver that will trigger each time elements are
    // added to or removed from the dom
    const observer = new MutationObserver(function () {
      // Each time the MutationObserver triggers, call the cleanup function
      // for each registered widget
      Object.values(registry)
        .filter(fn => typeof fn === 'function')
        .forEach(fn => fn.call());
    });
    observer.observe(document.body, { childList: true, subtree: true });
    registry.init = true;
  }

  // Render the component
  state.root = createRoot(container);
  state.root.render(
    <Component
      {...props}
      // Use a custom ref function that will update the api state with any
      // API functions or properties provided by the component
      ref={el => {
        if (typeof el?.api === 'object') {
          Object.assign(state.api, el.api);
        } else {
          // If there is no element or api (such as after the element is
          // unmounted) clear any API functions from the state
          Object.keys(state.api).forEach(key => {
            // Keep the container function since that's the initial API state
            if (!['container'].includes(key)) {
              delete state.api[key];
            }
          });
          // Add a destroyed flag after the component is unmounted
          Object.assign(state.api, { destroyed: true });
        }
      }}
    />,
  );

  // Register this widget by defining a cleanup function
  registry[key] = force => {
    // If the widget's container no longer exists in the dom or we are
    // forcing it to be removed
    if (force || !document.body.contains(container)) {
      // Unmount the widget
      state.root?.unmount();
      // Remove the cleanup function from the registry
      delete registry[key];
      // If a Widget was provided, remove the instance of the widget, only if
      // the container still matches (saving a form causes a rerender which
      // creates new instances before the cleanup is triggered)
      if (
        Widget?.instances?.[id || key] &&
        Widget.instances[id || key].container() === container
      ) {
        delete Widget.instances[id || key];
      }
    }
  };

  // Update the api state to add a destroy function for removing the widget
  Object.assign(state.api, {
    destroy: () => {
      // Trigger cleanup function if it exists, otherwise unmount the widget
      if (typeof registry[key] === 'function') {
        registry[key](true);
      } else {
        state.root?.unmount();
      }
      // Remove the key from the DOM container
      container?.removeAttribute('data-widget-key');
    },
  });

  // Store a reference to the api as an instance of the widget
  if (Widget?.instances) {
    Widget.instances[id || key] = state.api;
  }

  // Return a reference to the api
  return state.api;
};

/**
 * Class component that stores the provided API as an instance property, so it
 * can be accessed via the ref. This component should be used to wrap the
 * content that each widget renders, and should be forwarded the ref and passed
 * any API function to be exposed.
 */
export class WidgetAPI extends React.Component {
  constructor(props) {
    super(props);
    this.api = props.api;
  }

  render() {
    return this.props.children;
  }
}

// Validates that the container passed into the helper is a dom element
export const validateContainer = (container, widgetName = 'Custom') =>
  container instanceof HTMLElement
    ? true
    : console.error(
        `${widgetName} Widget Error: The container parameter must be a valid dom element.`,
      );

// Validates that the field passed into the helper is a Kinetic field. If the
// type parameter is provided, validates that the field is of that type.
export const validateField = (field, type, widgetName = 'Custom') =>
  field?.constructor?.name === 'Field' && (!type || field?.type() === type)
    ? true
    : console.error(
        `${widgetName} Widget Error: The field parameter must be a Kinetic field${
          type ? ` of type "${type}"` : ''
        }.`,
      );

// Validates that the form passed into the helper is a Kinetic form.
export const validateForm = (form, widgetName = 'Custom') =>
  form?.constructor?.name === 'Form'
    ? true
    : console.error(
        `${widgetName} Widget Error: The form parameter must be a Kinetic form.`,
      );
