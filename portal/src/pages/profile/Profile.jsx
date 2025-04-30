import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { produce } from 'immer';
import { useLocation } from 'react-router-dom';
import { updateProfile, updateSpace } from '@kineticdata/react';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { validateEmail } from '../../helpers/index.js';
import { appActions, themeActions } from '../../helpers/state.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import { getAttributeValue } from '../../helpers/records.js';
import { Menu } from '../../atoms/Menu.jsx';
import { openConfirm } from '../../helpers/confirm.js';

export const Profile = () => {
  const mobile = useSelector(state => state.view.mobile);
  const theme = useSelector(state => state.theme);
  const { profile, space } = useSelector(state => state.app);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showChangedPassword, setShowChangedPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(profile.email);
  const [newDisplayName, setNewDisplayName] = useState(profile.displayName);
  const [validationErrors, setValidationErrors] = useState({
    newEmail: '',
    newDisplayName: '',
    newPassword: '',
  });

  const location = useLocation();
  const backPath = location.state?.backPath;

  const portalKappSlug = getAttributeValue(
    space,
    'Service Portal Kapp Slug',
    'service-portal',
  );
  const portalKapp = space?.kapps?.find(k => k.slug === portalKappSlug) || {
    name: 'Invalid Kapp',
    slug: portalKappSlug,
  };

  const validateForm = () => {
    // Validate the fields
    const newValidationErrors = produce(validationErrors, o => {
      o.newEmail =
        newEmail.length <= 0
          ? 'Email is required'
          : !validateEmail(newEmail)
            ? 'Invalid email format'
            : '';
      o.newDisplayName =
        newDisplayName.length <= 0 ? 'Display Name is required.' : '';
      o.newPassword =
        showChangedPassword && newPassword.length <= 0
          ? 'Password is required.'
          : '';
    });

    // Update the validations state
    setValidationErrors(newValidationErrors);

    // Return true if none of the fields have errors
    return Object.values(newValidationErrors).every(o => !o);
  };

  const saveProfile = useCallback(
    async e => {
      e.preventDefault();

      if (validateForm() === false) {
        return;
      }

      let newProfileData = {
        displayName: newDisplayName,
        email: newEmail,
      };

      if (showChangedPassword && newPassword.length > 0) {
        newProfileData.password = newPassword;
      }

      updateProfile({
        profile: newProfileData,
      }).then(({ error, profile }) => {
        if (!error) {
          toastSuccess({ title: 'Your profile has been updated.' });
          appActions.updateProfile(profile);
        } else {
          toastError({
            title: 'Profile update failed.',
            description: error.message,
          });
        }
      });
    },
    [newPassword, newDisplayName, showChangedPassword, newEmail],
  );

  return (
    <>
      <div
        className={clsx('relative flex gap-3 items-center mt-8', {
          'justify-start': mobile,
          'justify-center': !mobile,
        })}
      >
        <Button
          variant="tertiary"
          icon="arrow-left"
          to={backPath || '..'}
          aria-label="Back"
          className={clsx(!mobile && 'absolute left-0')}
        />
        <span className="text-xl font-semibold text-center">My Profile</span>
      </div>
      <form className="self-center flex flex-col gap-5 items-stretch w-full max-w-lg">
        <div className="flex justify-center items-center mb-5 mt-8">
          <Avatar username={profile.username} size="2xl" />
        </div>

        <div
          className={clsx('field required', {
            'has-error': validationErrors.newEmail,
          })}
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            name="email"
            required={true}
            autoFocus
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
          {validationErrors.newEmail && (
            <p className="flex items-center gap-2 text-base-content/80">
              <span className="kstatus kstatus-error"></span>
              {validationErrors.newEmail}
            </p>
          )}
        </div>
        <div
          className={clsx('field required', {
            'has-error': validationErrors.newDisplayName,
          })}
        >
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            name="displayName"
            required={true}
            autoFocus
            value={newDisplayName}
            onChange={e => setNewDisplayName(e.target.value)}
          />
          {validationErrors.newDisplayName && (
            <p className="flex items-center gap-2 text-base-content/80">
              <span className="kstatus kstatus-error"></span>
              {validationErrors.newDisplayName}
            </p>
          )}
        </div>
        {showChangedPassword && (
          <div
            className={clsx('field required', {
              'has-error': validationErrors.newPassword,
            })}
          >
            <label htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required={true}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="pr-12"
              />
              <Button
                type="button"
                variant="custom"
                icon={`${showPassword ? 'eye-off' : 'eye'}`}
                aria-label={`${showPassword ? 'Hide Password' : 'Show Password'}`}
                className="absolute w-5 h-5 top-3 right-2.5 mr-3 flex items-center justify-center z-1 cursor-pointer"
                onClick={() => setShowPassword(prev => !prev)}
              />
            </div>
            {validationErrors.newPassword && (
              <p className="flex items-center gap-2 text-base-content/80">
                <span className="kstatus kstatus-error"></span>
                {validationErrors.newPassword}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          className="kbtn kbtn-ghost kbtn-xs self-end -mt-3"
          onClick={() => setShowChangedPassword(!showChangedPassword)}
        >
          {showChangedPassword === false ? 'Change password' : 'Cancel'}
        </button>

        <Button
          type="submit"
          onClick={saveProfile}
          className="mt-7"
          disabled={
            profile.email === newEmail &&
            profile.displayName === newDisplayName &&
            !showChangedPassword
          }
        >
          Save
        </Button>

        {profile.spaceAdmin && (
          <>
            <hr className="border-base-300" />
            <div className="field">
              <label htmlFor="">Current Portal Kapp</label>
              <Menu
                items={(space?.kapps || []).map(k => ({
                  label: `${k.name} <${k.slug}>`,
                  onClick: () => {
                    if (portalKappSlug !== k.slug) {
                      openConfirm({
                        title: 'Change Portal Kapp',
                        description: `Are you sure you want to change the portal kapp to ${k.name}?`,
                        acceptLabel: 'Yes',
                        accept: () => {
                          updateSpace({
                            space: {
                              attributesMap: {
                                'Service Portal Kapp Slug': [k.slug],
                              },
                            },
                            include: 'attributesMap,kapps',
                          }).then(({ error, space }) => {
                            if (error) {
                              toastError({
                                title: 'Failed to update portal kapp',
                                description: error.message,
                              });
                            } else {
                              toastSuccess({
                                title: 'Successfully updated portal kapp',
                              });
                              appActions.setSpace({ space });
                            }
                          });
                        },
                      });
                    }
                  },
                }))}
              >
                <Button
                  slot="trigger"
                  type="button"
                  variant="secondary"
                  className="w-full"
                >
                  {portalKapp.name} &lt;{portalKapp.slug}&gt;
                  <Icon name="chevron-down" className="ml-auto" />
                </Button>
              </Menu>
            </div>
            {theme.ready && (
              <div className="flex justify-center items-center">
                <Button
                  variant="tertiary"
                  onClick={() =>
                    theme.editor
                      ? themeActions.disableEditor()
                      : themeActions.enableEditor()
                  }
                >
                  {theme.editor
                    ? 'Disable Theme Editor'
                    : 'Enable Theme Editor'}
                </Button>
              </div>
            )}
          </>
        )}
      </form>
    </>
  );
};
