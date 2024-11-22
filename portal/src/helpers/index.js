import { formatDistance } from 'date-fns';

/******************************************************************************
 * General helper functions
 ******************************************************************************/

/**
 * Wraps a parameter in an array if it isn't already an array.
 *
 * @param {*|Array} maybeArray The parameter to wrap in an array if it isn't
 *  already an array.
 * @returns {Array}
 */
export const asArray = maybeArray =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

/**
 * Conditionally calls a function if the `fn` parameter is of type function.
 *
 * @param {Function|*} fn - Parameter to call if it is a function.
 * @param {*} [returnIfNotFn] - Parameter to return if `fn` is not a function.
 * @param {*[]} [args=[]] - List of arguments to pass to the `fn` parameter if
 *  it's a function.
 * @returns {*} Result of `fn` being called with `args` if it is a function, or
 *  `returnIfNotFn` otherwise.
 */
export const callIfFn = (fn, returnIfNotFn, args = []) => {
  if (typeof fn === 'function') return fn(...args);
  return returnIfNotFn;
};

/**
 * Parses `values` out of URL search parameters and returns them as a map.
 */
export const valuesFromQueryParams = queryParams => {
  return Object.entries(Object.fromEntries([...queryParams])).reduce(
    (values, [key, value]) => {
      if (key.startsWith('values[')) {
        const vk = key.match(/values\[(.*?)\]/)[1];
        return { ...values, [vk]: value };
      }
      return values;
    },
    {},
  );
};

export const timeAgo = date =>
  formatDistance(date, new Date(), { addSuffix: true });

/**
 * Validates email address using regex.
 */
export const validateEmail = email => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

/**
 * Creates a comparison function for sorting by a value of an object, with the
 * value accessed by key or using the provided function.
 *
 * @param {string|Function} key Property name of objects to be sorted that you
 *  want to sort by, or a function that takes the object to be sorted and
 *  returns a value to sort on.
 */
export const sortBy = key => (a, b) => {
  if (typeof key === 'function') {
    const va = key(a);
    const vb = key(b);
    return va < vb ? -1 : va > vb ? 1 : 0;
  }
  return a?.[key] < b?.[key] ? -1 : a?.[key] > b?.[key] ? 1 : 0;
};
