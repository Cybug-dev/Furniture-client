import { useState } from 'react';
import { useRequestPasswordReset, useResetPassword } from './auth.hooks.js';
import { getPasswordPolicyError, getPasswordStrength, PASSWORD_POLICY } from './password.policy.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PasswordResetForm({ initialEmail = '', onBack, onComplete }) {
  const [email, setEmail] = useState(initialEmail);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const request = useRequestPasswordReset();
  const reset = useResetPassword();
  const strength = getPasswordStrength(password);
  const busy = request.isPending || reset.isPending;

  const normalizedEmail = email.trim().toLowerCase();

  const sendCode = async (event) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setMessage({ type: 'error', text: 'Enter a valid email address.' });
      return;
    }

    setMessage(null);
    try {
      await request.mutateAsync({ email: normalizedEmail });
      setCodeSent(true);
      setMessage({
        type: 'success',
        text: 'If an account uses this email, a password reset code has been sent.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    const passwordError = getPasswordPolicyError(password);
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ type: 'error', text: 'Enter the six-digit code from your email.' });
      return;
    }
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'The passwords do not match.' });
      return;
    }

    setMessage(null);
    try {
      await reset.mutateAsync({ email: normalizedEmail, otp, password });
      onComplete(normalizedEmail);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <>
      <h1 className="auth__title">Reset your password</h1>
      <p className="auth__sub">
        {codeSent
          ? `Enter the code sent to ${normalizedEmail} and choose a new password.`
          : 'Enter your account email and we will send a six-digit reset code.'}
      </p>

      {message && (
        <div className={`auth__message auth__message--${message.type}`} role={message.type === 'success' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}

      {!codeSent ? (
        <form className="auth__form" onSubmit={sendCode} noValidate aria-busy={busy}>
          <div className="auth__field">
            <label htmlFor="reset-email">Email</label>
            <input
              className="auth__input"
              id="reset-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => { setEmail(event.target.value); setMessage(null); }}
              placeholder="you@example.com"
            />
          </div>
          <button className="auth__btn" type="submit" disabled={busy}>
            {request.isPending ? 'Sending code…' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form className="auth__form" onSubmit={submitReset} noValidate aria-busy={busy}>
          <div className="auth__field">
            <label htmlFor="reset-code">Reset code</label>
            <input
              className="auth__input"
              id="reset-code"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
            />
          </div>
          <div className="auth__field">
            <label htmlFor="reset-password">New password</label>
            <input
              className="auth__input"
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_POLICY.minLength}
              maxLength={PASSWORD_POLICY.maxLength}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={`${PASSWORD_POLICY.minLength}–${PASSWORD_POLICY.maxLength} characters`}
            />
            <div className={`auth__password-strength auth__password-strength--${strength.level}`} aria-live="polite">
              <div className="auth__strength-heading"><span>Password strength</span><strong>{strength.label}</strong></div>
              <div className="auth__strength-bars" aria-hidden="true">
                {[1, 2, 3, 4].map((level) => <span key={level} className={level <= strength.level ? 'is-active' : ''} />)}
              </div>
            </div>
          </div>
          <div className="auth__field">
            <label htmlFor="reset-password-confirmation">Confirm new password</label>
            <input
              className="auth__input"
              id="reset-password-confirmation"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              maxLength={PASSWORD_POLICY.maxLength}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter the new password again"
            />
          </div>
          <button className="auth__btn" type="submit" disabled={busy}>
            {reset.isPending ? 'Resetting password…' : 'Reset password'}
          </button>
          <button className="auth__guest" type="button" disabled={busy} onClick={() => { setCodeSent(false); setOtp(''); setMessage(null); }}>
            Send a new code
          </button>
        </form>
      )}

      <button className="auth__guest" type="button" disabled={busy} onClick={onBack}>
        Back to sign in
      </button>
    </>
  );
}
