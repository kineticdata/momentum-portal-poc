import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { Button } from '../../atoms/Button.js';
import { Avatar } from '../../atoms/Avatar.jsx';
import clsx from 'clsx';
import { produce } from 'immer';
import { updateProfile } from '@kineticdata/react';
import { validateEmail } from '../../helpers/index.js';
import { Icon } from '../../atoms/Icon.jsx';

export const Profile = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { profile } = useSelector(state => state.app);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showChangedPassword, setShowChangedPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(profile.email);
  const [newDisplayName, setNewDisplayName] = useState(profile.displayName);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    newEmail: '',
    newDisplayName: '',
    newPassword: '',
  });

  const validateForm = () => {
    let isValid = true;

    if (newEmail.length <= 0) {
      isValid = false;
      setValidationErrors(prevErrors =>
        produce(prevErrors, o => {
          o.newEmail = 'Email is required';
        }),
      );
    } else if (!validateEmail(newEmail)) {
      isValid = false;
      setValidationErrors(prevErrors =>
        produce(prevErrors, o => {
          o.newEmail = 'Invalid email format';
        }),
      );
    }

    if (newDisplayName.length <= 0) {
      isValid = false;
      setValidationErrors(prevErrors =>
        produce(prevErrors, o => {
          o.newDisplayName = 'Display Name is required.';
        }),
      );
    }

    if (showChangedPassword && newPassword.length <= 0) {
      isValid = false;
      setValidationErrors(prevErrors =>
        produce(prevErrors, o => {
          o.newPassword = 'Password is required.';
        }),
      );
    }

    return isValid;
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
          //todo: update global state
          //todo: add toast
          console.log('success:', profile);
        } else {
          setError(error);
        }
      });
    },
    [newPassword, newDisplayName, showChangedPassword, newEmail],
  );

  return (
    <>
      <div
        className={clsx('flex items-center mt-8', {
          'relative justify-start': mobile,
          'justify-center': !mobile,
        })}
      >
        <Button
          link
          variant="tertiary"
          icon="arrow-left"
          to=".."
          aria-label="Back"
          className={`${!mobile ? 'absolute left-24' : ''}`}
        />
        <span className="text-xl font-semibold text-center">My Profile</span>
      </div>
      <form className="self-center flex flex-col gap-5 items-stretch w-full max-w-lg">
        <div className="flex justify-center items-center mb-5 mt-8">
          <Avatar username={profile.displayName} size="xxl" />
        </div>
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
              {validationErrors.newPassword && (
                <span className="text-warning-500 mr-4">
                  {validationErrors.newPassword}
                </span>
              )}
              <Button
                type="button"
                variant="tertiary"
                className="font-semibold text-sm pl-0 !py-1 !justify-start !bg-transparent"
                onClick={() => setShowChangedPassword(false)}
              >
                Cancel
              </Button>
            </div>
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

        <Button type="submit" onClick={saveProfile} className="mt-7">
          Save
        </Button>
        <div className="flex items-center justify-center">
          <a className="btn-tertiary" href="/app/logout">
            <Icon name="logout" aria-label="Logout"></Icon>
            <span>Logout</span>
          </a>
        </div>
      </form>
      {error ? <div>{error}</div> : null}
    </>
  );
};
