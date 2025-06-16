import { Button } from '../../atoms/Button.jsx';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import logo from '../../assets/images/logo-full.svg';

export const Login = loginProps => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="flex flex-col items-center gap-6 w-[36rem] bg-white rounded-xl shadow-lg">
      <LoginForm {...loginProps} />
    </div>
  </div>
);

export const LoginForm = loginProps => {
  const {
    error,
    onChangePassword,
    onChangeUsername,
    onLogin,
    onSso,
    password,
    pending,
    username,
  } = loginProps;

  const themeLogo = useSelector(state => state.theme.logo);

  return (
    <form className="flex flex-col gap-5 items-stretch w-full p-5 max-w-96">
      <img
        src={themeLogo || logo}
        alt="Logo"
        className="h-10 max-w-45 object-contain mb-5 mt-5 self-center"
      />
      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          required={true}
          autoFocus
          value={username}
          onChange={onChangeUsername}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required={true}
          value={password}
          onChange={onChangePassword}
        />
      </div>
      {error && <p className="text-warning-500">{error}</p>}
      <Button
        type="submit"
        onClick={onLogin}
        disabled={pending || !username || !password}
      >
        Sign In
      </Button>
      {onSso && (
        <>
          <div className="flex justify-center items-center gap-2.5 text-gray-900 font-semibold leading-4">
            <hr className="inline w-16 border-gray-500" />
            OR
            <hr className="inline w-16 border-gray-500" />
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={onSso}
            disabled={pending}
          >
            Enterprise Single Sign-On
          </Button>
        </>
      )}
      <Link
        to="/reset-password"
        className={clsx(
          'flex justify-center items-center gap-1 text-gray-500 py-2.5 font-semibold',
          'hover:underline hover:text-gray-950',
        )}
      >
        Forgot your password?
      </Link>
    </form>
  );
};
