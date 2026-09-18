import { useState } from 'react';
import { useNavigate } from 'react-router';
import BedroomImg from '../assets/images/bedroom.png';
import './Auth.scss';

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="auth">
      <main className="auth__wrap">
        <section className="auth__visual">
          <img
            className="auth__image"
            src={BedroomImg}
            alt="Bright modern living room"
          />

          <div className="auth__overlay">
            <p className="auth__eyebrow">Share your setup with</p>

            <h2 className="auth__heading">
              A calmer home starts with pieces you love.
            </h2>

            <p className="auth__hash">#Furniture</p>
          </div>
        </section>

        <section className="auth__panel">
          <div className="auth__card">
            <div className="auth__tabs">
              <button
                type="button"
                className={`auth__tab ${isSignIn ? 'is-active' : ''}`}
                onClick={() => setIsSignIn(true)}
              >
                Sign in
              </button>

              <button
                type="button"
                className={`auth__tab ${!isSignIn ? 'is-active' : ''}`}
                onClick={() => setIsSignIn(false)}
              >
                Create account
              </button>
            </div>

            {isSignIn ? (
              <>
                <h1 className="auth__title">Welcome back</h1>

                <p className="auth__sub">
                  Sign in to save rooms, track orders, and keep your wishlist.
                </p>

                <form
                  className="auth__form"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="auth__field">
                    <label htmlFor="email">Email</label>

                    <input
                      className="auth__input"
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="auth__field">
                    <label htmlFor="password">Password</label>

                    <input
                      className="auth__input"
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="auth__row">
                    <label className="auth__check">
                      <input type="checkbox" />
                      Remember me
                    </label>

                    <button type="button" className="auth__link">
                      Forgot password?
                    </button>
                  </div>

                  <button className="auth__btn" type="submit">
                    Sign in
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="auth__title">Create your account</h1>

                <p className="auth__sub">
                  Join Furniture to save inspiration and shop your favorite
                  rooms.
                </p>

                <form
                  className="auth__form"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="auth__field">
                    <label htmlFor="name">Full name</label>

                    <input
                      className="auth__input"
                      id="name"
                      type="text"
                      placeholder="Alex Rivera"
                      required
                    />
                  </div>

                  <div className="auth__field">
                    <label htmlFor="email-up">Email</label>

                    <input
                      className="auth__input"
                      id="email-up"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="auth__field">
                    <label htmlFor="password-up">Password</label>

                    <input
                      className="auth__input"
                      id="password-up"
                      type="password"
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="auth__row">
                    <label className="auth__check">
                      <input type="checkbox" required />
                      I agree to the Terms
                    </label>
                  </div>

                  <button className="auth__btn" type="submit">
                    Create account
                  </button>
                </form>
              </>
            )}

            <div className="auth__divider">or continue with</div>

            <div className="auth__social">
              <button type="button">Google</button>
              <button type="button">Apple</button>
            </div>

            <button
              type="button"
              className="auth__guest"
              onClick={() => navigate('/')}
            >
              Instant Access
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}