import logo from '../../assets/images/logo-light.svg';
import { Button } from '../../atoms/Button.js';

export const Login = loginProps => (
  <>
    <LoginHeader />
    <LoginForm {...loginProps} />
  </>
);

export const LoginHeader = ({ children }) => (
  <div className="stretch flex flex-col justify-center gap-8 pt-4 pb-14 mb-16 rounded-b-[3.75rem] bg-primary-900">
    <div className="h-11 w-full">{children}</div>
    <img src={logo} alt="Logo" className="h-12" />
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

  return (
    <form className="self-center flex flex-col gap-5 items-stretch w-full max-w-96">
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
      <Button link variant="tertiary" underline to="/reset-password">
        Forgot your password?
      </Button>
    </form>
  );
};
