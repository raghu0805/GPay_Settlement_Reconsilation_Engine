import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="page-card max-w-xl text-center">
        <p className="label">Not Found</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-text">
          This page does not exist.
        </h1>
        <p className="mt-3 text-sm leading-7 text-text-subtle">
          The requested route is unavailable in the current DSRE development build.
        </p>
        <Link className="primary-button mt-6" to="/">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
