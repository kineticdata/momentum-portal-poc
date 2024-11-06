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
