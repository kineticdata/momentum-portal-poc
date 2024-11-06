import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { callIfFn } from './index.js';

const initialState = {
  // Has the data been retrieved
  initialized: false,
  // Is the data being retrieved
  loading: false,
  // Error response
  error: null,
  // Response data, transformed if applicable
  data: [],
  // Current page token
  pageToken: null,
  // Next page token
  nextPageToken: null,
  // Previous page tokens list
  previousPageTokens: [],
  // Timestamp of last fetch to prevent earlier fetches from updating state if
  // multiple simultaneous fetches are triggered
  lastFetch: null,
};

/**
 * Retrieves a list of data and returns relevant data and meta properties, as
 * well as actions for handling pagination.
 *
 * @param {Function} apiFunction - A Kinetic API function for fetching a list of
 *  data, that uses page token pagination (or no pagination).
 * @param {*[]} [parameters] - An array of parameters that will be passed into
 *  the `apiFunction`. If falsy, the fetch will not be triggered.
 * @param {Function} [transform] - A transform function that will be called with
 *  the response from the `apiFunction` before the response is returned.
 * @returns {[DataListState, DataListActions]} - A state object of relevant data
 *  and an actions object of relevant functions.
 */
const useDataList = (apiFunction, parameters, transform) => {
  // Create state for the data list
  const [state, setState] = useState(initialState);
  // Create a state update function that takes a timestamp, and only updates
  // the state if the timestamp matches the lastFetch value
  const setTimestampedState = useCallback(
    (timestamp, newState) =>
      setState(currentState => {
        if (currentState.lastFetch === timestamp) {
          return callIfFn(newState, newState, [currentState]);
        }
        return currentState;
      }),
    [],
  );

  // Memoize the provided parameters using deep compare to only trigger a
  // re-fetch when the parameter values change
  const memoizedParameters = useDeepCompareMemo(() => parameters, [parameters]);

  // Memoize the transform function because we don't expect it to change without
  // the parameters changing.
  const memoizedTransform = useDeepCompareCallback(transform, [parameters]);

  /**
   * Defines a function that will preform the data fetch based on the provided
   * `apiFunction` and `parameters`
   *
   * @param {*[]} currentParameters - The parameters to pass to the
   *  `apiFunction`.
   * @param {Object} [stateChanges] - An object of state changes that should be
   *  made when this fetch is triggered. This is useful for setting pagination
   *  state data.
   */
  const fetch = useCallback(
    (currentParameters, stateChanges = {}) => {
      // Generate a timestamp so that the async call's response only updates the
      // state if no other calls were made after this one
      const timestamp = new Date().getTime();
      // Update the state to set the correct loading, initialized, and lastFetch
      // values, as well as any provided state changes
      setState(currentState => ({
        ...currentState,
        ...stateChanges,
        loading: true,
        initialized: true,
        lastFetch: timestamp,
      }));

      // Only perform the fetch if the parameters are not falsy
      if (currentParameters) {
        // Call the provided `apiFunction` with the passed in parameters
        apiFunction(...currentParameters).then(
          ({ error, nextPageToken, ...response }) => {
            if (error) {
              // If an error is returned, reset the state to the initial state,
              // but set initialized to true, and add the error to the state
              setTimestampedState(timestamp, {
                ...initialState,
                initialized: true,
                error,
              });
            } else {
              // If the call succeeded, set the data, transforming it if a
              // `transform` function was provided.
              setTimestampedState(timestamp, currentState => ({
                ...currentState,
                loading: false,
                data: callIfFn(memoizedTransform, response, [response]),
                nextPageToken,
              }));
            }
          },
        );
      }
    },
    [setTimestampedState, apiFunction, memoizedTransform],
  );

  /**
   * Resets the list's pagination and reloads the first page of data.
   */
  const reset = useCallback(() => {
    if (state.initialized) {
      fetch(memoizedParameters, initialState);
    }
  }, [fetch, state, memoizedParameters]);

  /**
   * Reloads the current page of data.
   */
  const reload = useCallback(() => {
    if (state.initialized) {
      const [options, ...otherParams] = memoizedParameters;
      // Add the current pageToken to the options object of the parameters
      fetch([{ ...options, pageToken: state.pageToken }, ...otherParams]);
    }
  }, [fetch, state, memoizedParameters]);

  /**
   * Fetches the next page of data, if there is more data.
   */
  const nextPage = useCallback(() => {
    if (state.initialized && state.nextPageToken) {
      // Create pagination state updates to move to the next page
      const updatedState = {
        pageToken: state.nextPageToken,
        nextPageToken: null,
        previousPageTokens: [...state.previousPageTokens, state.pageToken],
      };
      const [options, ...otherParams] = memoizedParameters;
      // Add the next pageToken to the options object of the parameters, and
      // update the state with the new pagination state
      fetch(
        [{ ...options, pageToken: updatedState.pageToken }, ...otherParams],
        updatedState,
      );
    }
  }, [fetch, state, memoizedParameters]);

  /**
   * Fetches the previous page of data, if we're not on the first page.
   */
  const previousPage = useCallback(() => {
    if (state.initialized && state.previousPageTokens.length > 0) {
      // Create pagination state updates to move to the next page
      const updatedState = {
        pageToken: state.previousPageTokens.pop(),
        nextPageToken: null,
        previousPageTokens: state.previousPageTokens,
      };
      const [options, ...otherParams] = memoizedParameters;
      // Add the previous pageToken to the options object of the parameters, and
      // update the state with the new pagination state
      fetch(
        [{ ...options, pageToken: updatedState.pageToken }, ...otherParams],
        updatedState,
      );
    }
  }, [fetch, state, memoizedParameters]);

  // Trigger the fetch function with the provided parameters whenever the
  // parameters change, and only if they exist. Reset the state whenever the
  // parameters change, because we're now doing a new query.
  useEffect(() => {
    if (memoizedParameters) {
      fetch(memoizedParameters, initialState);
    } else {
      setState({ ...initialState });
    }
  }, [fetch, memoizedParameters]);

  /**
   * @type {DataListState}
   */
  const returnState = useDeepCompareMemo(
    () => ({
      initialized: state.initialized,
      loading: state.loading,
      error: structuredClone(state.error),
      data: structuredClone(state.data),
      pageNumber: state.previousPageTokens.length + 1,
    }),
    [state],
  );

  /**
   * @type {DataListActions}
   */
  const returnActions = useMemo(
    () => ({
      reset,
      reload,
      nextPage: state.nextPageToken ? nextPage : undefined,
      previousPage:
        state.previousPageTokens.length > 0 ? previousPage : undefined,
    }),
    [
      reset,
      reload,
      nextPage,
      previousPage,
      state.nextPageToken,
      state.previousPageTokens.length,
    ],
  );

  return [returnState, returnActions];
};

export default useDataList;

/**
 * @typedef {Object} DataListState - The state of the data list.
 * @property {boolean} initialized - Has the list fetch been triggered at least
 *  once.
 * @property {boolean} loading - Is the list being retrieved right now.
 * @property {Object} error - Error object returned from the `apiFunction`.
 * @property {*} data - Transformed data returned from the `apiFunction`.
 * @property {number} pageNumber - The current page number, starting at 1.
 */

/**
 * @typedef {Object} DataListActions - An object of actions related to the data
 *  list.
 * @property {Function} reset - Resets the pagination and retrieves the first
 *  page.
 * @property {Function} reload - Reloads the current page of data.
 * @property {Function} [previousPage] - Retrieves the previous page of data.
 *  Only provided if a previous page exists.
 * @property {Function} [nextPage] - Retrieves the next page of data. Only
 *  provided if a next page exists.
 */
