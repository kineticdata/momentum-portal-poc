[&#x2B9C; Back to Kinetic Form Widgets](README.md)

## Toast Widget

The toast widget provides access to toast functions, allowing builders to provide feedback to users. This widget doesn't render anything into the form dom, and thus works differently from the documentation above.

This widget does not get initialized the same way as other widgets. Instead, it is just a container for functions that can be used to render toast messages.

```js
// Show a success toast
bundle.widgets.Toast.success({ title, description, duration });

// Show an error toast
bundle.widgets.Toast.error({ title, description, duration });

// Clear all toasts
bundle.widgets.Toast.clear();
```

_\* If you need to use a toast while a subform modal is open, use the provided toast functions that are part of the [subform widget API](SUBFORM.md#api) instead of these functions. This widget renders the toasts outside the modal, so interacting with them would close the modal._

### Static API

![name=success](https://img.shields.io/badge/success%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders a success toast on the page. See [Options Object Properties](#options-object-properties) for details on available options.

![name=error](https://img.shields.io/badge/error%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders an error toast on the page. See [Options Object Properties](#options-object-properties) for details on available options.

![name=clear](https://img.shields.io/badge/clear%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Closes all currently open toasts.

#### Options Object Properties

![name=title](https://img.shields.io/badge/title-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The title to render in the toast.

![name=description](https://img.shields.io/badge/description-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The description to render in the toast.

![name=duration](https://img.shields.io/badge/duration-gray)
![type=number](https://img.shields.io/badge/number-e66e22)  
The duration that the toast should be visible, in milliseconds.
