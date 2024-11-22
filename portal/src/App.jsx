import t from 'prop-types';
import { useEffect } from 'react';
import { fetchKapp, fetchProfile, fetchSpace } from '@kineticdata/react';
import { useSelector } from 'react-redux';
import { Toaster } from './atoms/Toaster.jsx';
import { Loading } from './components/states/Loading.jsx';
import { Error } from './components/states/Error.jsx';
import { closeConfirm } from './helpers/confirm.js';
import { appActions, themeActions } from './helpers/state.js';
import { clearToasts } from './helpers/toasts.js';
import useDataItem from './helpers/useDataItem.js';
import useRouteChange from './helpers/useRouteChange.js';
import { PrivateRoutes } from './pages/PrivateRoutes.jsx';
import { PublicRoutes } from './pages/PublicRoutes.jsx';
import { Login } from './pages/login/Login.jsx';
import { ConfirmationModal } from './components/confirm/ConfirmationModal.jsx';

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
      const cssSheet = new CSSStyleSheet();
      cssSheet.replace(themeCSS);
      // Set this new constructed stylesheet to be used by the page
      document.adoptedStyleSheets = [cssSheet];
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
      loggedIn && [
        { include: 'profileAttributesMap,attributesMap,memberships' },
      ],
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
      kappSlug && [
        {
          kappSlug,
          include: 'attributesMap,categories,categories.attributesMap',
        },
      ],
    response => response.kapp,
  );
  // Set the space data into redux
  useEffect(() => {
    if (kappData.initialized && !kappData.loading) {
      appActions.setKapp(kappData);
    }
  }, [kappData]);

  // Clear toasts and confirmation modals whenever we change routes
  useRouteChange((pathname, state) => {
    if (!state?.persistToasts) {
      clearToasts();
    }
    closeConfirm();
  }, []);

  return (
    <>
      <div className="flex flex-col flex-auto overflow-auto">
        {/* Header element where we will render headers via a portal */}
        <header id="app-header" />

        <main
          id="app-main"
          className="flex flex-col flex-auto relative overflow-auto scrollbar"
        >
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

          {/* Toast container */}
          <Toaster />
        </main>

        {/* Footer element where we will render footers via a portal */}
        <footer id="app-footer" />
      </div>

      {/* Panels element where we will render panels via a portal */}
      <div id="app-panels" />

      {/* Global confirmation modal */}
      <ConfirmationModal />
    </>
  );
};

App.propTypes = {
  initialized: t.bool,
  loggedIn: t.bool,
  loginProps: t.object,
  timedOut: t.bool,
  serverError: t.object,
};
