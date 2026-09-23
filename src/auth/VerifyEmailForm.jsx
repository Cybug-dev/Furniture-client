import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resendVerification, verifyEmail } from './auth.api.js';
import { AUTH_USER_QUERY_KEY } from './auth.hooks.js';
import { isPrivateQuery } from '../commerce/commerce.utils.js';

export function VerifyEmailForm({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const verification = useMutation({ mutationFn: verifyEmail });
  const resend = useMutation({ mutationFn: resendVerification });
  const busy = verification.isPending || resend.isPending;

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const user = await verification.mutateAsync({ email, otp: otp.trim() });
      await queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY });
      await queryClient.cancelQueries({ predicate: isPrivateQuery });
      queryClient.removeQueries({ predicate: isPrivateQuery });
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      onVerified(user);
    } catch { /* The mutation error is displayed below. */ }
  }

  return <>
    <h1 className="auth__title">Verify your email</h1>
    <p className="auth__sub">Enter the verification code sent to <strong>{email}</strong>. Check your spam folder too.</p>
    {(verification.error || resend.error) && <p role="alert" className="auth__message">{(verification.error || resend.error).message}</p>}
    {message && <p role="status" className="auth__message auth__message--success">{message}</p>}
    <form onSubmit={submit} aria-busy={busy}>
      <div className="auth__field">
        <label htmlFor="verification-code">Verification code</label>
        <input id="verification-code" className="auth__input" value={otp} onChange={(event) => setOtp(event.target.value)} autoComplete="one-time-code" inputMode="numeric" required maxLength={12} />
      </div>
      <button className="auth__btn" disabled={busy || !otp.trim()}>{verification.isPending ? 'Verifying…' : 'Verify email'}</button>
    </form>
    <button type="button" className="auth__guest" disabled={busy} onClick={async () => {
      verification.reset();
      setMessage('');
      try {
        await resend.mutateAsync({ email });
        setMessage('A new code has been requested. Please check your inbox.');
      } catch { /* The mutation error is displayed above. */ }
    }}>{resend.isPending ? 'Sending…' : 'Send another code'}</button>
    <button type="button" className="auth__guest" disabled={busy} onClick={onBack}>Back to sign in</button>
  </>;
}
