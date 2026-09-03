import './Auth.css';
import BedroomImg from '../assets/images/bedroom.png';
import { useState } from 'react';

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <main className="wrap">
      <section className="visual">
        <img
          className="hero"
          src={BedroomImg}
          alt="Bright modern living room with a sectional sofa"
        />

        <div className="visual-overlay">
          <p className="kicker">Share your setup with</p>
          <h2>A calmer home starts with pieces you love.</h2>
          <p className="hash">#Furniture</p>
        </div>
      </section>

      <section className="panel">
        <div className="card">

          <div className="tabs" role="tablist">
            <button
              id="tab-in"
              className={isSignIn ? 'active' : ''}
              type="button"
              onClick={() => setIsSignIn(true)}
            >
              Sign in
            </button>

            <button
              id="tab-up"
              className={!isSignIn ? 'active' : ''}
              type="button"
              onClick={() => setIsSignIn(false)}
            >
              Register
            </button>
          </div>

          {isSignIn ? (
            <div id="view-in">
              <h1>Welcome back</h1>

              <p className="sub">
                Sign in to save rooms, track orders, and keep your wishlist.
              </p>

              <form id="form-in">
                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    id="email-in"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    id="pass-in"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="row">
                  <label className="check">
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <a className="link" href="#">
                    Forgot password?
                  </a>
                </div>

                <button className="btn" type="submit">
                  Sign in
                </button>
              </form>
            </div>
          ) : (
            <div id="view-up">
              <h1>Create your account</h1>

              <p className="sub">
                Join Furniture to save inspiration and shop your favorite rooms.
              </p>

              <form id="form-up">
                <div className="field">
                  <label>Full name</label>
                  <input
                    className="input"
                    id="name-up"
                    type="text"
                    placeholder="Alex Rivera"
                    required
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    id="email-up"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    id="pass-up"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="row">
                  <label className="check">
                    <input type="checkbox" required />
                    I agree to the Terms
                  </label>
                </div>

                <button className="btn" type="submit">
                  Create account
                </button>
              </form>
            </div>
          )}

          <div className="divider">or continue with</div>

          <div className="social">
            <button type="button">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.5 3.6v3h4c2.3-2.1 3.5-5.2 3.5-8.7z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-2.9l-4-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.3v3.1C3.3 21.4 7.4 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4V6.5H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.5l4.1-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 6.5l4.1 3.1C6.3 6.9 8.9 4.8 12 4.8z"
                />
              </svg>
              Google
            </button>

            <button type="button">
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="currentColor"
              >
                <path d="M11.4 8.4c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.2-.8-2.2-3.3zM9.5 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
              </svg>
              Apple
            </button>
          </div>

          <div id="toast" className="toast"></div>

        </div>
      </section>
    </main>
  );
}