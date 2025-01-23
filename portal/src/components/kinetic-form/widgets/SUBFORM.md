[&#x2B9C; Back to Kinetic Form Widgets](README.md)

## Subform Widget

The subform widget renders a Kinetic form in either a modal or inline, allowing users to provide additional information, and the builder to collect the data and store it however they find appropriate.

```js
// Initialize the Markdown widget
bundle.widgets.Subform({ container, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Subform.get(id);
```

### Parameters

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
<br>
<blockquote>

![name=kappSlug](https://img.shields.io/badge/kappSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the kapp in which the subform you want to render exists.

![name=formSlug](https://img.shields.io/badge/formSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the form you want to render.

![name=submissionId](https://img.shields.io/badge/submissionId-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The submission id of the submission you want to render.

![name=values](https://img.shields.io/badge/values-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
Map of default field values to use for the form.

![name=review](https://img.shields.io/badge/review-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the form be rendered in review mode.

![name=onLoad](https://img.shields.io/badge/onLoad%28subform,%20actions%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that's called when the subform is loaded.  
It is passed `subform` which is the Kinetic form object of the subform, and `actions` which is an object of action functions, containing `close` which closes the subform.

![name=onSave](https://img.shields.io/badge/onSave%28subform,%20actions%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that's called when the save button of the widget is clicked. If omitted, the save button will not be rendered.  
It is passed `subform` which is the Kinetic form object of the subform, and `actions` which is an object of action functions, containing `close` which closes the subform.

![name=onError](https://img.shields.io/badge/onError%28actions%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that's called when the subform fails to load.  
It is passed `actions` which is an object of action functions, containing `close` which closes the subform.

![name=inline](https://img.shields.io/badge/inline-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the form render inline instead of in a modal.

![name=modalTitle](https://img.shields.io/badge/modalTitle-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The title for the modal when the subform is rendered in a modal.

![name=saveLabel](https://img.shields.io/badge/saveLabel-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The label for the save button.

</blockquote>
</details>

![name=id](https://img.shields.io/badge/id-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

### API

![name=subform](https://img.shields.io/badge/subform%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the Kinetic form object of the subform.

![name=toastSuccess](https://img.shields.io/badge/toastSuccess%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders a success toast that's part of the modal's dom so it can be interacted with without the modal getting closed.  
**This API function is only available if the subform is rendered in a modal.** See [Options Object Properties](TOAST.md#options-object-properties) in the Toast widget documentation for details on available options.

![name=toastError](https://img.shields.io/badge/toastError%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders an error toast that's part of the modal's dom so it can be interacted with without the modal getting closed.  
**This API function is only available if the subform is rendered in a modal.** See [Options Object Properties](TOAST.md#options-object-properties) in the Toast widget documentation for details on available options.

### Examples

```js
// Renders an inline subform
bundle.widgets.Subform({
  // Render the widget into a Content element named "Subform Container"
  container: K('content[Subform Container]').element(),
  config: {
    // Define the form we want to render
    kappSlug: kapp('slug'),
    formSlug: 'employee-address',
    // Provide default values for the form
    values: { State: 'MN' },
    // Set inline to true to render the subform directly within the parent form
    inline: true,
  },
  id: 'address-subform',
});

// Get the Kinetic form object of the subform
bundle.widgets.Subform.get('address-subform').subform();

// Get the data of the subform as JSON
bundle.widgets.Subform.get('address-subform').subform().serialize();
```

```js
// Renders a subform in a modal, and stores its JSON data in a field on the form
bundle.widgets.Subform({
  // Render the widget into a Content element named "Subform Container"
  container: K('section[Subform Container]').element(),
  config: {
    // Define the form we want to render
    kappSlug: kapp('slug'),
    formSlug: 'employee-address',
    // Define the title for the modal
    modalTitle: 'Address Information',
    // Define an onSave function that will be triggered when the user clicks
    // the save button in the modal
    onSave: function (subform, actions) {
      // Validate the subform
      const validation = subform.validate();
      // If it's valid
      if (Object.keys(validation).length === 0) {
        // Store the stringified result of the subform into a text field
        K('field[Address JSON]').value(JSON.stringify(subform.serialize()));
        // Show a success toast
        bundle.widgets.Toast.success({ title: 'Address added successfully' });
        // Close the subform
        actions.close();
      }
      // If there are invalid fields
      else {
        // Show an error toast; note that we're using the toast function from
        // the subform here because we need the toast to be inside the modal so
        // interacting with it doesn't close the modal
        bundle.widgets.Subform.get('subform').toastError({
          title: 'The form is invalid',
          description: Object.values(validation)
            .map(function (error) {
              return error[0];
            })
            .join('\n'),
        });
      }
    },
  },
  id: 'address-subform',
});
```

```js
// Renders a subform in a modal, submits it to create a submission, and stores
// the submission id in a field on the form
bundle.widgets.Subform({
  // Render the widget into a Content element named "Subform Container"
  container: K('section[Subform Container]').element(),
  config: {
    // Define the form we want to render
    kappSlug: kapp('slug'),
    formSlug: 'employee-address',
    // Define the title for the modal
    modalTitle: 'Address Information',
    // Define an onSave function that will be triggered when the user clicks
    // the save button in the modal
    onSave: function (subform, actions) {
      // Call the `submitPage` function to submit the subform
      subform.submitPage(function (result) {
        // Store the resulting submission id into a text field
        K('field[Address Submission Id]').value(result.submission.id);
        // Show a success toast
        bundle.widgets.Toast.success({ title: 'Address added successfully' });
        // Close the subform
        actions.close();
      });
    },
  },
  id: 'address-subform',
});
```
