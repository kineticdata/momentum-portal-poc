import React from 'react';
import { registerWidget, validateContainer, WidgetAPI } from './index.js';

const SearchComponent = React.forwardRef((props, ref) => {
  return (
    <WidgetAPI ref={ref} api={{}}>
      TODO: Search Functionally
    </WidgetAPI>
  );
});

/**
 * Function that initializes a Search widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} options
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Markdown.get` function.
 */
export const Search = ({ container, options, id } = {}) => {
  if (validateContainer(container, 'Search')) {
    return registerWidget(Search, {
      container,
      Component: SearchComponent,
      props: {},
      id,
    });
  }
};
