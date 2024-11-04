import t from 'prop-types';
import { useEffect } from 'react';
import { fetchKapp, fetchProfile, fetchSpace } from '@kineticdata/react';
import { useSelector } from 'react-redux';
import { regRedux } from './redux.js';
import { Loading } from './components/states/Loading.jsx';
import { Error } from './components/states/Error.js';
import { PrivateRoutes } from './pages/PrivateRoutes.jsx';
import { PublicRoutes } from './pages/PublicRoutes.jsx';
import { Login } from './pages/login/Login.jsx';
import useDataItem from './helpers/useDataItem.js';
import { getAttributeValue } from './helpers/records.js';
import { throttle } from 'lodash-es';
import { calculateThemeState, themeState } from './helpers/theme.js';

// State for the current view size of the app
const viewActions = regRedux(
  'view',
  { ...calcViewState() },
  {
    handleResize(state) {
      calcViewState(state);
    },
  },
);
// Register a resize handler to update the view state
window.addEventListener('resize', throttle(viewActions.handleResize, 200));

// State for the customized theme
const themeActions = regRedux(
  'theme',
  { ...themeState },
  {
    setTheme(state, space) {
      calculateThemeState(state, getAttributeValue(space.data, 'Theme'));
    },
  },
);

// State for global app data
const appActions = regRedux(
  'app',
  {
    // Is the user authenticated
    authenticated: false,
    // Space record
    space: null,
    // Slug of the kapp to use for the service portal
    kappSlug: null,
    // Service portal kapp record
    kapp: null,
    // Profile record
    profile: null,
    // Error from fetching any app data
    error: null,
  },
  {
    setAuthenticated(state, payload) {
      state.authenticated = payload;
    },
    setSpace(state, { error, data }) {
      if (error) state.error = error;
      else {
        state.space = data;
        state.kappSlug = getAttributeValue(
          data,
          'Service Portal Kapp Slug',
          'service-portal',
        );
      }
    },
    setKapp(state, { error, data }) {
      if (error) state.error = state.error || error;
      else state.kapp = data;
    },
    setProfile(state, { error, data }) {
      if (error) state.error = state.error || error;
      else state.profile = data;
    },
  },
);

export const App = ({
  initialized,
  loggedIn,
  loginProps,
  timedOut,
  serverError,
}) => {
  // Get redux theme state
  const themeCSS = useSelector(state => state.theme.css);
  // Update the styles if there is a theme set
  useEffect(() => {
    if (themeCSS) {
      // If themeCSS exists, create a stylesheet and set themeCSS as the content
      const csssheet = new CSSStyleSheet();
      csssheet.replace(themeCSS);
      // Set this new constructed stylesheet to be used by the page
      document.adoptedStyleSheets = [csssheet];
    }
  }, [themeCSS]);

  // Get redux app state
  const { authenticated, kappSlug, error, space, kapp, profile } = useSelector(
    state => state.app,
  );

  // Set an `authenticated` flag in global state that is synced to the loggedIn
  // prop, and can be used in the app to determine if the user is authenticated
  useEffect(() => {
    if (authenticated !== loggedIn) {
      appActions.setAuthenticated(loggedIn);
    }
  }, [authenticated, loggedIn]);

  // Fetch space data. We'll assume that the space record is available publicly
  // so we can get the config data stored in space attributes
  const [spaceData] = useDataItem(
    fetchSpace,
    initialized && [
      loggedIn
        ? { include: 'attributesMap,kapps' }
        : { public: true, include: 'attributesMap,kapps' },
    ],
    response => response.space,
  );
  // Set the space data into redux
  useEffect(() => {
    if (spaceData.initialized && !spaceData.loading) {
      appActions.setSpace(spaceData);
      themeActions.setTheme(spaceData);
    }
  }, [spaceData]);

  // Fetch profile data once the user is logged in
  const [profileData] = useDataItem(
    fetchProfile,
    initialized &&
      loggedIn && [{ include: 'profileAttributesMap,attributesMap' }],
    response => response.profile,
  );
  // Set the profile data into redux
  useEffect(() => {
    if (profileData.initialized && !profileData.loading) {
      appActions.setProfile(profileData);
    }
  }, [profileData]);

  // Fetch kapp data once the user is logged in and a kapp slug is set, which
  // happens after the space is retrieved
  const [kappData] = useDataItem(
    fetchKapp,
    initialized &&
      loggedIn &&
      kappSlug && [{ kappSlug, include: 'attributesMap,categorizations' }],
    response => response.kapp,
  );
  // Set the space data into redux
  useEffect(() => {
    if (kappData.initialized && !kappData.loading) {
      appActions.setKapp(kappData);
    }
  }, [kappData]);

  return (
    <>
      <div className="flex flex-col flex-auto overflow-auto">
        {/* Header element where we will render headers via a portal */}
        <header id="app-header" />

        <main id="app-main" className="flex flex-col flex-auto overflow-auto">
          {serverError || error ? (
            // If an error occurred during auth or fetching app data, show an
            // error screen
            <Error error={serverError || error} />
          ) : !initialized || !space ? (
            // If auth isn't initialized or space record isn't fetched, show a
            // loading screen
            <Loading />
          ) : !loggedIn ? (
            // If the user is not logged in, render the public routes, which
            // will default to rendering the login page for all unmatched routes
            <PublicRoutes loginProps={loginProps} />
          ) : kapp && profile ? (
            // If the user is logged in and kapp and profile data has been
            // fetched, render the private routes, and render the Login
            // component in a modal if auth times out
            <>
              <PrivateRoutes />
              {timedOut && (
                <dialog open>
                  <Login {...loginProps} />
                </dialog>
              )}
            </>
          ) : (
            <Loading />
          )}
        </main>

        {/* Footer element where we will render footers via a portal */}
        <footer id="app-footer" />
      </div>

      {/* Panels element where we will render panels via a portal */}
      <div id="app-panels" />
    </>
  );
};

/**
 * Function that updates a state object with the latest view data
 * @param {Object} state
 * @returns {Object}
 */
function calcViewState(state = {}) {
  state.width = window.innerWidth;
  if (window.innerWidth < 640) {
    state.size = 'xs';
  } else if (window.innerWidth < 768) {
    state.size = 'sm';
  } else if (window.innerWidth < 1024) {
    state.size = 'md';
  } else if (window.innerWidth < 1280) {
    state.size = 'lg';
  } else if (window.innerWidth < 1536) {
    state.size = 'xl';
  } else {
    state.size = '2xl';
  }
  state.mobile = ['xs', 'sm'].includes(state.size);
  state.tablet = ['md', 'lg'].includes(state.size);
  state.desktop = ['xl', '2xl'].includes(state.size);
  return state;
}

App.propTypes = {
  initialized: t.bool,
  loggedIn: t.bool,
  loginProps: t.object,
  timedOut: t.bool,
  serverError: t.object,
};
