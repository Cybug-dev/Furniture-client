import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import BedroomImg from '../assets/images/bedroom.png';
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from './auth.hooks.js';
import {
  getServerFieldErrors,
  splitFullName,
  validateLogin,
  validateRegistration,
} from './auth.validation.js';
import './Auth.scss';
import { VerifyEmailForm } from './VerifyEmailForm.jsx';
import { getPasswordStrength, PASSWORD_POLICY } from './password.policy.js';

const getSafeReturnPath = (state) => {
  const requestedPath =
    typeof state?.from === 'string' ? state.from : state?.from?.pathname;

  return requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
    ? requestedPath
    : '/';
};

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCodeSentAt, setVerificationCodeSentAt] = useState(null);
  const [loginFields, setLoginFields] = useState({ email: '', password: '' });
  const [registrationFields, setRegistrationFields] = useState({
    fullName: '',
    email: '',
    password: '',
    acceptedTerms: false,
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [registrationErrors, setRegistrationErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserQuery = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const currentUser = currentUserQuery.data;
  const passwordStrength = getPasswordStrength(registrationFields.password);

  const selectMode = (nextIsSignIn) => {
    setVerificationEmail('');
    setVerificationCodeSentAt(null);
    setIsSignIn(nextIsSignIn);
    setLoginErrors({});
    setRegistrationErrors({});
    setFormMessage(null);
    loginMutation.reset();
    registerMutation.reset();
  };

  const updateLoginField = (field, value) => {
    setLoginFields((current) => ({ ...current, [field]: value }));
    setLoginErrors((current) => ({ ...current, [field]: undefined }));
    setFormMessage(null);
  };

  const updateRegistrationField = (field, value) => {
    setRegistrationFields((current) => ({ ...current, [field]: value }));
    setRegistrationErrors((current) => ({ ...current, [field]: undefined }));
    setFormMessage(null);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(loginFields);

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors);
      return;
    }

    setLoginErrors({});
    setFormMessage(null);

    try {
      await loginMutation.mutateAsync({
        email: loginFields.email.trim().toLowerCase(),
        password: loginFields.password,
      });
      navigate(getSafeReturnPath(location.state), { replace: true });
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        setVerificationEmail(loginFields.email.trim().toLowerCase());
        setVerificationCodeSentAt(null);
        setLoginFields((current) => ({ ...current, password: '' }));
      }
      setLoginErrors(getServerFieldErrors(error));
      setFormMessage({ type: 'error', text: error.message });
    }
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegistration(registrationFields);

    if (Object.keys(nextErrors).length > 0) {
      setRegistrationErrors(nextErrors);
      return;
    }

    setRegistrationErrors({});
    setFormMessage(null);
    const { firstName, lastName } = splitFullName(registrationFields.fullName);

    try {
      await registerMutation.mutateAsync({
        email: registrationFields.email.trim().toLowerCase(),
        password: registrationFields.password,
        firstName,
        lastName,
      });
      setLoginFields({
        email: registrationFields.email.trim().toLowerCase(),
        password: '',
      });
      setRegistrationFields((current) => ({ ...current, password: '' }));
      setIsSignIn(true);
      setVerificationEmail(registrationFields.email.trim().toLowerCase());
      setVerificationCodeSentAt(Date.now());
      setFormMessage({
        type: 'success',
        text: 'Account created. Verify your email to continue.',
      });
    } catch (error) {
      setRegistrationErrors(getServerFieldErrors(error));
      setFormMessage({ type: 'error', text: error.message });
    }
  };

  const handleLogout = async () => {
    setFormMessage(null);

    try {
      await logoutMutation.mutateAsync();
      setIsSignIn(true);
      setFormMessage({ type: 'success', text: 'You have been signed out.' });
    } catch (error) {
      setIsSignIn(true);
      setFormMessage({
        type: 'error',
        text: `Your local session was cleared. ${error.message}`,
      });
    }
  };

  const sessionErrorMessage =
    currentUserQuery.isError && !formMessage
      ? 'We could not verify an existing session. You can still sign in below.'
      : null;

  return (
    <div className="auth">
      <main className="auth__wrap">
        <section className="auth__visual" aria-label="Furniture inspiration">
          <img
            className="auth__image"
            src={BedroomImg}
            alt="Bright modern bedroom with warm wooden furniture"
          />

          <div className="auth__overlay">
            <p className="auth__eyebrow">Share your setup with</p>
            <h2 className="auth__heading">
              A calmer home starts with pieces you love.
            </h2>
            <p className="auth__hash">#Furniture</p>
          </div>
        </section>

        <section className="auth__panel" aria-label="Account access">
          <div className="auth__card">
            {currentUser ? (
              <div className="auth__signed-in">
                <span className="auth__account-mark" aria-hidden="true">
                  {(currentUser.firstName || currentUser.email).charAt(0).toUpperCase()}
                </span>
                <p className="auth__eyebrow auth__eyebrow--brand">Your account</p>
                <h1 className="auth__title">
                  Welcome{currentUser.firstName ? `, ${currentUser.firstName}` : ''}
                </h1>
                <p className="auth__sub">
                  You are signed in as <strong>{currentUser.email}</strong>.
                </p>
                <button className="auth__btn" type="button" onClick={() => navigate('/')}>
                  Continue shopping
                </button>
                <button
                  className="auth__guest"
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            ) : (
              <>
                <div className="auth__tabs" role="tablist" aria-label="Account options">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSignIn}
                    className={`auth__tab ${isSignIn ? 'is-active' : ''}`}
                    onClick={() => selectMode(true)}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isSignIn}
                    className={`auth__tab ${!isSignIn ? 'is-active' : ''}`}
                    onClick={() => selectMode(false)}
                  >
                    Create account
                  </button>
                </div>

                {(formMessage || sessionErrorMessage) && (
                  <div
                    className={`auth__message auth__message--${formMessage?.type ?? 'error'}`}
                    role={formMessage?.type === 'success' ? 'status' : 'alert'}
                  >
                    {formMessage?.text ?? sessionErrorMessage}
                  </div>
                )}

                {verificationEmail ? (
                  <VerifyEmailForm
                    email={verificationEmail}
                    codeSentAt={verificationCodeSentAt}
                    onBack={() => selectMode(true)}
                    onVerified={(user) => {
                      setVerificationEmail('');
                      setVerificationCodeSentAt(null);
                      if (user) navigate(getSafeReturnPath(location.state), { replace: true });
                      else {
                        setIsSignIn(true);
                        setFormMessage({ type: 'success', text: 'Email verified. Sign in to continue.' });
                      }
                    }}
                  />
                ) : isSignIn ? (
                  <>
                    <h1 className="auth__title">Welcome back</h1>
                    <p className="auth__sub">
                      Sign in to save rooms, track orders, and keep your wishlist.
                    </p>

                    <form
                      className="auth__form"
                      onSubmit={handleLogin}
                      noValidate
                      aria-busy={loginMutation.isPending}
                    >
                      <div className="auth__field">
                        <label htmlFor="login-email">Email</label>
                        <input
                          className="auth__input"
                          id="login-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={loginFields.email}
                          onChange={(event) => updateLoginField('email', event.target.value)}
                          aria-invalid={Boolean(loginErrors.email)}
                          aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
                        />
                        {loginErrors.email && (
                          <p className="auth__field-error" id="login-email-error">
                            {loginErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="auth__field">
                        <label htmlFor="login-password">Password</label>
                        <div className="auth__input-wrap">
                          <input
                            className="auth__input auth__input--password"
                            id="login-password"
                            name="password"
                            type={showLoginPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={loginFields.password}
                            onChange={(event) => updateLoginField('password', event.target.value)}
                            aria-invalid={Boolean(loginErrors.password)}
                            aria-describedby={loginErrors.password ? 'login-password-error' : undefined}
                          />
                          <button
                            className="auth__password-toggle"
                            type="button"
                            onClick={() => setShowLoginPassword((visible) => !visible)}
                            aria-label={`${showLoginPassword ? 'Hide' : 'Show'} password`}
                          >
                            {showLoginPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {loginErrors.password && (
                          <p className="auth__field-error" id="login-password-error">
                            {loginErrors.password}
                          </p>
                        )}
                      </div>

                      <p className="auth__unavailable">
                        Password recovery is not available yet.
                      </p>

                      <button
                        className="auth__btn"
                        type="submit"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h1 className="auth__title">Create your account</h1>
                    <p className="auth__sub">
                      Join Furniture to save inspiration and shop your favorite rooms.
                    </p>

                    <form
                      className="auth__form"
                      onSubmit={handleRegistration}
                      noValidate
                      aria-busy={registerMutation.isPending}
                    >
                      <div className="auth__field">
                        <label htmlFor="register-name">Full name</label>
                        <input
                          className="auth__input"
                          id="register-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          maxLength={201}
                          placeholder="Alex Rivera"
                          value={registrationFields.fullName}
                          onChange={(event) =>
                            updateRegistrationField('fullName', event.target.value)
                          }
                          aria-invalid={Boolean(registrationErrors.fullName)}
                          aria-describedby={
                            registrationErrors.fullName ? 'register-name-error' : undefined
                          }
                        />
                        {registrationErrors.fullName && (
                          <p className="auth__field-error" id="register-name-error">
                            {registrationErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div className="auth__field">
                        <label htmlFor="register-email">Email</label>
                        <input
                          className="auth__input"
                          id="register-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={registrationFields.email}
                          onChange={(event) =>
                            updateRegistrationField('email', event.target.value)
                          }
                          aria-invalid={Boolean(registrationErrors.email)}
                          aria-describedby={
                            registrationErrors.email ? 'register-email-error' : undefined
                          }
                        />
                        {registrationErrors.email && (
                          <p className="auth__field-error" id="register-email-error">
                            {registrationErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="auth__field">
                        <label htmlFor="register-password">Password</label>
                        <div className="auth__input-wrap">
                          <input
                            className="auth__input auth__input--password"
                            id="register-password"
                            name="password"
                            type={showRegistrationPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            minLength={PASSWORD_POLICY.minLength}
                            maxLength={PASSWORD_POLICY.maxLength}
                            placeholder={`${PASSWORD_POLICY.minLength}–${PASSWORD_POLICY.maxLength} characters`}
                            value={registrationFields.password}
                            onChange={(event) =>
                              updateRegistrationField('password', event.target.value)
                            }
                            aria-invalid={Boolean(registrationErrors.password)}
                            aria-describedby={
                              registrationErrors.password
                                ? 'register-password-error'
                                : 'register-password-strength register-password-requirements'
                            }
                          />
                          <button
                            className="auth__password-toggle"
                            type="button"
                            onClick={() =>
                              setShowRegistrationPassword((visible) => !visible)
                            }
                            aria-label={`${showRegistrationPassword ? 'Hide' : 'Show'} password`}
                          >
                            {showRegistrationPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {registrationErrors.password && (
                          <p className="auth__field-error" id="register-password-error">
                            {registrationErrors.password}
                          </p>
                        )}
                        <div
                          className={`auth__password-strength auth__password-strength--${passwordStrength.level}`}
                          id="register-password-strength"
                          aria-live="polite"
                        >
                          <div className="auth__strength-heading">
                            <span>Password strength</span>
                            <strong>{passwordStrength.label}</strong>
                          </div>
                          <div className="auth__strength-bars" aria-hidden="true">
                            {[1, 2, 3, 4].map((level) => (
                              <span key={level} className={level <= passwordStrength.level ? 'is-active' : ''} />
                            ))}
                          </div>
                        </div>
                        <ul className="auth__password-requirements" id="register-password-requirements">
                          <li className={passwordStrength.checks.length ? 'is-met' : ''}>At least {PASSWORD_POLICY.minLength} characters</li>
                          <li className={passwordStrength.checks.letter ? 'is-met' : ''}>One letter</li>
                          <li className={passwordStrength.checks.number ? 'is-met' : ''}>One number</li>
                          <li className={passwordStrength.checks.special ? 'is-met' : ''}>One special character</li>
                        </ul>
                      </div>

                      <div className="auth__row">
                        <label className="auth__check">
                          <input
                            type="checkbox"
                            checked={registrationFields.acceptedTerms}
                            onChange={(event) =>
                              updateRegistrationField('acceptedTerms', event.target.checked)
                            }
                            aria-invalid={Boolean(registrationErrors.acceptedTerms)}
                            aria-describedby={
                              registrationErrors.acceptedTerms
                                ? 'register-terms-error'
                                : undefined
                            }
                          />
                          I agree to the Terms
                        </label>
                      </div>
                      {registrationErrors.acceptedTerms && (
                        <p className="auth__field-error auth__field-error--terms" id="register-terms-error">
                          {registrationErrors.acceptedTerms}
                        </p>
                      )}

                      <button
                        className="auth__btn"
                        type="submit"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Creating account…' : 'Create account'}
                      </button>
                    </form>
                  </>
                )}

                <div className="auth__divider">Social sign-in coming later</div>
                <div className="auth__social" aria-label="Unavailable social sign-in options">
                  <button type="button" disabled title="Google sign-in is not available yet">
                    Google
                  </button>
                  <button type="button" disabled title="Apple sign-in is not available yet">
                    Apple
                  </button>
                </div>

                <button type="button" className="auth__guest" onClick={() => navigate('/')}>
                  Continue as guest
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
