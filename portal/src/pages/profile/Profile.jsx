import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { produce } from 'immer';
import { updateProfile } from '@kineticdata/react';
import { Avatar } from '../../atoms/Avatar.jsx';
import { Button } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { validateEmail } from '../../helpers/index.js';
import { appActions, themeActions } from '../../helpers/state.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';

export const Profile = () => {
  const mobile = useSelector(state => state.view.mobile);
  const theme = useSelector(state => state.theme);
  const { profile } = useSelector(state => state.app);
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
          to=".."
          aria-label="Back"
          className={clsx(!mobile && 'absolute left-0')}
        />
        <span className="text-xl font-semibold text-center">My Profile</span>
      </div>
      <form className="self-center flex flex-col gap-5 items-stretch w-full max-w-lg">
        <div className="flex justify-center items-center mb-5 mt-8">
          <Avatar username={profile.username} size="xxl" />
        </div>
        {profile.spaceAdmin && theme.ready && (
          <div className="flex justify-center items-center">
            <Button
              variant="tertiary"
              onClick={() =>
                theme.editor
                  ? themeActions.disableEditor()
                  : themeActions.enableEditor()
              }
            >
              {theme.editor ? 'Disable Theme Editor' : 'Enable Theme Editor'}
            </Button>
          </div>
        )}
        <div
          className={clsx('field', { 'has-error': validationErrors.newEmail })}
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
          {validationErrors.newEmail && <p>{validationErrors.newEmail}</p>}
        </div>
        <div
          className={clsx('field', {
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
            <p>{validationErrors.newDisplayName}</p>
          )}
        </div>
        {showChangedPassword && (
          <div
            className={clsx('field', {
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
                className="w-full px-4 pr-10 py-2"
              />
              <Button
                type="button"
                variant="tertiary"
                icon={`${showPassword ? 'eye-off' : 'eye'}`}
                aria-label={`${showPassword ? 'Hide Password' : 'Show Password'}`}
                className="absolute w-5 h-5 top-3 right-2.5 mr-3 flex items-center justify-center"
                onClick={() => setShowPassword(prev => !prev)}
              />
            </div>
            {validationErrors.newPassword && (
              <span className="text-warning-500 mr-4">
                {validationErrors.newPassword}
              </span>
            )}
            <Button
              type="button"
              variant="tertiary"
              className="block font-semibold text-sm pl-0 !py-1 !justify-start !bg-transparent"
              onClick={() => setShowChangedPassword(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        {showChangedPassword === false && (
          <Button
            type="button"
            variant="tertiary"
            className="font-semibold text-sm text-left pl-0 !justify-start !bg-transparent"
            onClick={() => setShowChangedPassword(true)}
          >
            Change password
          </Button>
        )}

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
        <div className="flex items-center justify-center">
          <a className="btn-tertiary" href="/app/logout">
            <Icon name="logout" aria-label="Logout"></Icon>
            <span>Logout</span>
          </a>
        </div>
      </form>
    </>
  );
};
