import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resendVerification, verifyEmail } from './auth.api.js';
import { AUTH_USER_QUERY_KEY } from './auth.hooks.js';
import { isPrivateQuery } from '../commerce/commerce.utils.js';
import {
  clearVerificationResendState,
  getVerificationResendState,
  noteInitialVerificationCode,
  recordVerificationResend,
  VERIFICATION_CODE_TTL_SECONDS,
} from './verification-resend.policy.js';

const formatWait = (seconds) => seconds >= 60
  ? `${Math.ceil(seconds / 60)} min`
  : `${seconds}s`;

export function VerifyEmailForm({ email, codeSentAt, onVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [resendState, setResendState] = useState(() => getVerificationResendState(email));
  const queryClient = useQueryClient();
  const verification = useMutation({ mutationFn: verifyEmail });
  const resend = useMutation({ mutationFn: resendVerification });
  const busy = verification.isPending || resend.isPending;

  useEffect(() => {
    if (codeSentAt) noteInitialVerificationCode(email, { sentAt: codeSentAt });
    const refresh = () => setResendState(getVerificationResendState(email));
    refresh();
    const timer = globalThis.setInterval(refresh, 1000);
    return () => globalThis.clearInterval(timer);
  }, [codeSentAt, email]);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const user = await verification.mutateAsync({ email, otp });
      await queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY });
      await queryClient.cancelQueries({ predicate: isPrivateQuery });
      queryClient.removeQueries({ predicate: isPrivateQuery });
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      clearVerificationResendState(email);
      onVerified(user);
    } catch { /* The mutation error is displayed below. */ }
  }

  return <>
    <h1 className="auth__title">Verify your email</h1>
    <p className="auth__sub">
      Enter the six-digit verification code sent to <strong>{email}</strong>. It expires in {VERIFICATION_CODE_TTL_SECONDS / 60} minutes.
    </p>
    {(verification.error || resend.error) && <p role="alert" className="auth__message">{(verification.error || resend.error).message}</p>}
    {message && <p role="status" className="auth__message auth__message--success">{message}</p>}
    <form onSubmit={submit} aria-busy={busy}>
      <div className="auth__field">
        <label htmlFor="verification-code">Verification code</label>
        <input
          id="verification-code"
          className="auth__input"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d{6}"
          required
          minLength={6}
          maxLength={6}
        />
      </div>
      <button className="auth__btn" disabled={busy || otp.length !== 6}>
        {verification.isPending ? 'Verifying…' : 'Verify email'}
      </button>
    </form>
    <p className="auth__unavailable">
      {resendState.remaining} of 3 resend requests available in each five-minute window.
    </p>
    <button
      type="button"
      className="auth__guest"
      disabled={busy || !resendState.canResend}
      onClick={async () => {
        verification.reset();
        setMessage('');
        try {
          await resend.mutateAsync({ email });
          setOtp('');
          const nextState = recordVerificationResend(email);
          setResendState(nextState);
          setMessage('A new code has been requested. Older codes will no longer work.');
        } catch { /* The mutation error is displayed above. */ }
      }}
    >
      {resend.isPending
        ? 'Sending…'
        : resendState.retryAfterSeconds > 0
          ? `Send again in ${formatWait(resendState.retryAfterSeconds)}`
          : `Send another code (${resendState.remaining} left)`}
    </button>
    <button type="button" className="auth__guest" disabled={busy} onClick={onBack}>Back to sign in</button>
  </>;
}
