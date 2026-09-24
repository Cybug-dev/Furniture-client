import { useCurrentUser } from './auth.hooks.js';

export function AuthSessionGate({ children }) {
  const { isPending } = useCurrentUser();

  if (isPending) {
    return (
      <div className="auth-session" role="status" aria-live="polite">
        <span className="auth-session__spinner" aria-hidden="true" />
        <span>Checking your session…</span>
      </div>
    );
  }

  return children;
}
