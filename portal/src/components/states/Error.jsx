export const Error = ({ error }) =>
  error && (
    <div className="text-warning-500 flex flex-col gap-2 p-6">
      {error.statusCode && <h1>{error.statusCode}</h1>}
      <h2>Error</h2>
      <p>{error.message}</p>
    </div>
  );
