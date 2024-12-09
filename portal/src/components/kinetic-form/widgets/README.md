# Kinetic Form Widgets

Widgets ar small, standalone React apps that can be rendered inside Kinetic forms to provide more complex functionality within the server side rendered form.

## Table of Contents

- [How to Use Widgets](#how-to-use-widgets)
- [Available Widgets](#available-widgets)
  - [Markdown](#markdown) - Renders a markdown editor or viewer.
  - [Search](#search) - Renders a typeahead search field.
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
  // The config parameter will allow you to pass specific configurations to a widget.
  config: {},
  // The id parameter lets you uniquely name this instance of the widget so you can access it later.
  id: 'my-widget',
  // There may be other required properties for different widgets.
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
bundle.widgets.Markdown({ container, field, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Markdown.get(id);
```

#### Parameters

![name=container](https://img.shields.io/badge/container-gray)
![type=HTMLElement](https://img.shields.io/badge/HTMLElement-e66e22)  
The HTML element into which the widget should be rendered.

![name=field](https://img.shields.io/badge/field-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
The Kinetic field object of a text field with 2+ rows that should be used to store the value of the raw markdown content. The value of the field will be used as the initial value for the editor.

<details>
<summary>
  <img alt="name=config" src="https://img.shields.io/badge/config-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  An object of configurations for the widget.
</summary>
<blockquote>

![name=className](https://img.shields.io/badge/className-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Additional class names to add to the wrapper of the widget.

![name=disabled](https://img.shields.io/badge/disabled-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the editor be disabled. If omitted, this will be set to `true` if the form is in review mode. When `disabled` is `true`, this widget will render the markdown content instead of an editor.

![name=editorProps](https://img.shields.io/badge/editorProps-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
Object of props to pass through to the editor component. See the `@toast-ui/react-editor` `Editor` component for valid options.

</blockquote>
</details>

![](https://img.shields.io/badge/id-gray)
![](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

#### API

![name=getValue](https://img.shields.io/badge/getValue%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the current text value of the editor content.

![name=setValue](https://img.shields.io/badge/setValue%28newValue%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Sets the value of the markdown editor to the provided `newValue`.

![name=enable](https://img.shields.io/badge/enable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Disables the editor, and renders the markdown in a viewer instead.

![name=disable](https://img.shields.io/badge/disable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Enables the editor and renders the content in editable mode.

### Search

The search widget renders a typeahead style search field that can be configured to filter static data, or search data retrieved through an integration.

```js
// Initialize the Markdown widget
bundle.widgets.Search({ container, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Search.get(id);
```

#### Parameters

![name=container](https://img.shields.io/badge/container-gray)
![type=HTMLElement](https://img.shields.io/badge/HTMLElement-e66e22)  
The HTML element into which the widget should be rendered.

<details>
<summary>
  <img alt="name=config" src="https://img.shields.io/badge/config-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  An object of configurations for the widget.
</summary>
<blockquote>

![name=options](https://img.shields.io/badge/options-gray)
![type=Object[]](https://img.shields.io/badge/Object[]-e66e22)  
List of objects to use as the static options for the search functionality.

<details>
<summary>
  <img alt="name=search" src="https://img.shields.io/badge/search-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Search configuration for how the user typed in value should be used in filtering the results when static options are provided.
</summary>
<blockquote>

<details>
<summary>
  <img alt="name=fields" src="https://img.shields.io/badge/fields-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  A list of fields that should be searched in the static list of options. This is ignored if the <code>fn</code> property is provided.
</summary>
<blockquote>

![name=name](https://img.shields.io/badge/name-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the property to search.

![name=value](https://img.shields.io/badge/value-gray)
![type=any](https://img.shields.io/badge/any-e66e22)  
The value that the option must match to be accepted. If omitted, the typed in user query will be used.

![name=operator](https://img.shields.io/badge/operator-gray)
![type=string](https://img.shields.io/badge/'equals'%7C'matches'%7C'startsWith'-e66e22)  
The operation type to use when searching through the options. Defaults to "startsWith".

</blockquote>
</details>

![name=fn](https://img.shields.io/badge/fn%28options%2c%20query%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A function to use for filtering the options based on the user query. It takes the list of options and the search query, and returns a filtered list of options.

</blockquote>
</details>
<br>
<details>
<summary>
  <img alt="name=integration" src="https://img.shields.io/badge/integration-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Data defining the integration to use for retrieving data for the search functionality.
</summary>
<blockquote>

![name=kappSlug](https://img.shields.io/badge/kappSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the kapp in which the integration exists.

![name=formSlug](https://img.shields.io/badge/formSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the form in which the integration exists. If omitted, a kapp integration will be used.

![name=integrationName](https://img.shields.io/badge/integrationName-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the integration to use.

![name=listProperty](https://img.shields.io/badge/listProperty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the output property of the integration response that contains the list data to use.

<details>
<summary>
  <img alt="name=parameters" src="https://img.shields.io/badge/parameters-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  A list of parameters that should be passed into the integration.
</summary>
<blockquote>

![name=name](https://img.shields.io/badge/name-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the parameter to pass into the integration.

![name=value](https://img.shields.io/badge/value-gray)
![type=any](https://img.shields.io/badge/any-e66e22)  
The value to set the parameter to. If omitted, the typed in user query will be used.

</blockquote>
</details>

</blockquote>
</details>

![name=initialSelection](https://img.shields.io/badge/initialSelection-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
The option object that should be initially selected when the widget loads.

![name=optionToValue](https://img.shields.io/badge/optionToValue%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a value that can uniquely identify this option. If omitted, the `value` property of the option will be used.

![name=optionToLabel](https://img.shields.io/badge/optionToLabel%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a label that is rendered in the field when the option is selected. if omitted, the `label` property of the option will be used if it exists, otherwise the value from `optionToValue` will be used.

![name=optionToTitle](https://img.shields.io/badge/optionToTitle%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a title that is rendered in the list of options when the option is shown. If omitted, the label from `optionToLabel` will be used.

![name=optionToDescription](https://img.shields.io/badge/optionToDescription%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a description that is rendered in the list of options when the option is shown. If omitted, a description will not be shown.

![name=selectionBehavior](https://img.shields.io/badge/selectionBehavior-gray)
![type=string](https://img.shields.io/badge/'replace'%7C'clear'%7C'preserve'-e66e22)  
Behavior of the field when an option is selected: 'replace' (default) will show the option label, 'clear' will empty the field, and 'preserve' will keep the user's query.

![name=minSearchLength](https://img.shields.io/badge/minSearchLength-gray)
![type=number](https://img.shields.io/badge/number-e66e22)  
The number of character that need to be typed in before options are shown. Defaults to `1`.

![name=onChange](https://img.shields.io/badge/onChange%28selection%2c%20value%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the value is changed. It is passed two parameters, the `selection` which is the selected option object, and the `value` string.

![name=onFocus](https://img.shields.io/badge/onFocus%28event%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the field is focused.

![name=onBlur](https://img.shields.io/badge/onBlur%28event%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the field is blurred.

![name=disabled](https://img.shields.io/badge/disabled-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the field be disabled.

![name=placeholder](https://img.shields.io/badge/placeholder-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Placeholder to render in the field when it is empty.

![name=icon](https://img.shields.io/badge/icon-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Name of the icon to render in the field. Defaults to `search`.

<details>
<summary>
  <img alt="name=messages" src="https://img.shields.io/badge/messages-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Object of status messages to display during various states.
</summary>
<blockquote>

![name=short](https://img.shields.io/badge/short-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when there are not enough character typed in to trigger a search.

![name=empty](https://img.shields.io/badge/empty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when there are no results matching the query.

![name=pending](https://img.shields.io/badge/pending-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when options are being retrieved or filtered.

</blockquote>
</details>

</blockquote>
</details>

![](https://img.shields.io/badge/id-gray)
![](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

#### API

![name=getSelection](https://img.shields.io/badge/getSelection%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the currently selected option object.

![name=setSelection](https://img.shields.io/badge/setSelection%28newSelection%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Sets the selection of the search field. The `newSelection` parameter must be an object of the same shape as the options the field uses.

![name=enable](https://img.shields.io/badge/enable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Disables the search field.

![name=disable](https://img.shields.io/badge/disable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Enables the search field.

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
export const CustomWidget = ({ container, config, id } = {}) => {
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

The parameters that this function accepts are up to you, and will depend on the purpose of the widget. Typically, `container`, `config`, and `id` will almost always be needed. Sometimes you will need a reference to a Kinetic field or the Kinetic form, so those may be others you would add. The contents of the `config` object are specific to your widget.

This function must follow the following rules:

- It must validate the parameters to make sure the user is providing valid data. There are helper functions for validating the container, as well as Kinetic field and form objects, but you may also add widget specific validations.
- It must call `registerWidget` and return the response of that function. `registerWidget` accepts a reference to this function as the first parameter, and the following properties inside an object as the second parameter:
  - `container` The HTML element into which your widget component should be rendered.
  - `Component` The custom widget component you defined in the previous step.
  - `props` Any props that should be passed to the above component. Typically, you will pass in the config here.
  - `id` A unique ID if passed into the widget function.

### Exposing the Custom Widget

Once the widget function has been created, it needs to be exposed via the `bundles.widgets` namespace.

To do this, go into the `./index.js` file, import your new widget function, and add it to the `AVAILABLE_WIDGETS` map. And that's it! You can now access your new widget from the `bundles.widgets` global variable.
