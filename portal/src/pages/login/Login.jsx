import { Link } from 'react-router-dom';

export const Login = loginProps => (
  <div className="flex-auto flex justify-center items-center">
    <LoginForm {...loginProps} />
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
    <form className="border border-gray-600 rounded p-6">
      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          className="form-control"
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
          className="form-control"
          id="password"
          type="password"
          name="password"
          required={true}
          value={password}
          onChange={onChangePassword}
        />
      </div>
      {error && <div className="">{error}</div>}
      <button
        className="btn"
        type="submit"
        onClick={onLogin}
        disabled={pending || !username || !password}
      >
        Sign In
      </button>
      {/*{onSso && (*/}
        <button
          className="btn"
          type="button"
          onClick={onSso}
          disabled={pending}
        >
          Enterprise Single Sign-On
        </button>
      {/*)}*/}
      <Link to="/reset-password" className="btn">
        Forgot your password?
      </Link>
    </form>
  );
};
