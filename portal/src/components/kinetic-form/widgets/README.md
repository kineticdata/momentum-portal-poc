# Kinetic Form Widgets

Widgets ar small, standalone React apps that can be rendered inside Kinetic forms to provide more complex functionality within the server side rendered form.

## Table of Contents

- [How to Use Widgets](#how-to-use-widgets)
- [Available Widgets](#available-widgets)
  - [Markdown](#markdown) - Renders a markdown editor or viewer.
  - [Search](#search) _(COMING SOON)_ - Renders a typeahead search field.
- [How to Build Widgets](#how-to-build-widgets)

---

## How to Use Widgets

We define functions in a global `bundle.widgets` namespace to expose widgets, and they can then be used in Kinetic form events.

Given a widget called `CustomWidget`, the following code will render the widget into the form.

```js
const customWidget = bundle.widgets.CustomWidget({
  // The container parameter must be an HTML element into which the widget should be rendered.
  // Here we are using a Kinetic section element.
  container: K('section[Widget Section]').element(),
  // The options parameter will allow you to pass specific configurations to a widget.
  options: {},
  // The id parameter lets you uniquely name this instance of the widget so you can access it later.
  id: 'my-widget',
});
```

After a widget is rendered using the above code, you can access any API functions the widget returns. Different widgets may expose additional API functions specific to their functionality.

```js
// Get the container element that the widget is rendered in.
customWidget.container();

// Remove the widget from the form.
customWidget.destroy();
```

If you provided an `id` when initializing the widget, you can also access the API functions without storing the result of the widget initialization function.

```js
const customWidgetAPI = bundle.widgets.CustomWidget.get('my-widget');
```

---

## Available Widgets

### Markdown

The markdown widget renders a markdown editor (or viewer when disabled), allowing users to use a WYSIWYG markdown editor to input content, which will then be stored in a text field of the form.

```js
// Initialize the Markdown widget
bundle.widgets.Markdown(container, field, options, id);

// Retrieve a reference to the widget's API
bundle.widgets.Markdown.get(id);
```

#### Parameters

| name        | type          | description                                                                                                                                                                                       |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container` | `HTMLElement` | The HTML element into which the widget should be rendered.                                                                                                                                        |
| `field`     | `Object`      | The Kinetic field object of a text field with 2+ rows that should be used to store the value of the raw markdown content. The value of the field will be used as the inital value for the editor. |
| `options`   | `Object`      | An object of options for the widget. See Options section below for more details.                                                                                                                  |
| `id`        | `string`      | A unique id that can be used to retrieve the API of the widget.                                                                                                                                   |

#### Options

| name          | type      | description                                                                                                                                                                                        |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`   | `string`  | Additional class names to add to the wrapper of the widget.                                                                                                                                        |
| `disabled`    | `boolean` | Should the editor be disabled. If omitted, this will be set to `true` if the form is in review mode. When `disabled` is `true`, this widget will render the markdown content instead of an editor. |
| `editorProps` | `object`  | Object of props to pass through to the editor component. See the `@toast-ui/react-editor` `Editor` component for valid options.                                                                    |

### Search

**_(COMING SOON)_**

The search widget renders a typeahead style search field that can be configured to search data via an integration.

```js
// Initialize the Markdown widget
bundle.widgets.Search(container, options, id);

// Retrieve a reference to the widget's API
bundle.widgets.Search.get(id);
```

#### Parameters

| name        | type          | description                                                                      |
| ----------- | ------------- | -------------------------------------------------------------------------------- |
| `container` | `HTMLElement` | The HTML element into which the widget should be rendered.                       |
| `options`   | `Object`      | An object of options for the widget. See Options section below for more details. |
| `id`        | `string`      | A unique id that can be used to retrieve the API of the widget.                  |

#### Options

| name | type | description |
| ---- | ---- | ----------- |
| TODO |      |             |

---

## How to Build Widgets

To build a custom widget, you will create a new file in this directory for that widget, and implement the specific functionality there. There are some helper functions in the `./index.js` file that help us build new widgets.

| name                | type              | description                                                                                                                                                                  |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerWidget`    | `function`        | A function that handles rendering the widget into the provided container, exposes the API for the widget, and handles tracking the widget and cleaning it up when necessary. |
| `validateContainer` | `function`        | A function that validates that the `container` parameter is a valid HTML element.                                                                                            |
| `validateField`     | `function`        | A function that validates that a `field` parameter is a Kinetic field object, and can also verify the type of the field.                                                     |
| `validateForm`      | `function`        | A function that validates that a `form` parameter is a Kinetic form object.                                                                                                  |
| `WidgetAPI`         | `React Component` | A component that wraps the custom widget functionality in order to expose an API for the widget.                                                                             |

### Defining the Custom Widget Functionality

First you will create a component that will be rendered by the widget. This component is where you will implement all of your custom functionality. (If you need to split this into multiple components or files, that fine, but the result should be a single component that will be rendered by the widget.)

```jsx
const CustomWidgetComponent = React.forwardRef((props, ref) => {
  return (
    <WidgetAPI ref={ref} api={{}}>
      Your custom JSX should be rendered here.
    </WidgetAPI>
  );
});
```

Your component must follow the following rules:

- It must use `React.forwardRef` so we can forward a `ref` to the `WidgetAPI` component that it will render.
- It must render the `WidgetAPI` component, by wrapping it around the returned content.
  - The `WidgetAPI` component must be passed the forwarded `ref`.
  - The `WidgetAPI` component may be passed an `api` prop which should be an object of functions or properties that the widget would like to expose when it is used.

Beyond the above rules, your component can add any additional logic it needs.

### Defining the Custom Widget Function

After the widget component is created, you will create a function that will be used to initialize the widget. The majority of this process is done by the helper functions described above. This is the function that will be exported from this file.

```jsx
export const CustomWidget = ({ container, options, id } = {}) => {
  if (validateContainer(container, 'Custom')) {
    return registerWidget(CustomWidget, {
      container,
      Component: CustomWidgetComponent,
      props: {},
      id,
    });
  }
};
```

The parameters that this function accepts are up to you, and will depend on the purpose of the widget. Typically, `container`, `options`, and `id` will almost always be needed. Sometimes you will need a reference to a Kinetic field or the Kinetic form, so those may be others you would add. The contents of the `options` object are specific to your widget.

This function must follow the following rules:

- It must validate the parameters to make sure the user is providing valid data. There are helper functions for validating the container, as well as Kinetic field and form objects, but you may also add widget specific validations.
- It must call `registerWidget` and return the response of that function. `registerWidget` accepts a reference to this function as the first parameter, and the following options inside an object as the second parameter:
  - `container` The HTML element into which your widget component should be rendered.
  - `Component` The custom widget component you defined in the previous step.
  - `props` Any props that should be passed to the above component. Typically, you will pass in the options here.
  - `id` A unique ID if passed into the widget function.

### Exposing the Custom Widget

Once the widget function has been created, it needs to be exposed via the `bundles.widgets` namespace.

To do this, go into the `./index.js` file, import your new widget function, and add it to the `AVAILABLE_WIDGETS` map. And that's it! You can now access your new widget from the `bundles.widgets` global variable.
