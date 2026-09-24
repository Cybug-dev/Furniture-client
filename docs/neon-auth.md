# Furniture account setup

Sign-up, login, verification codes and logout use Managed Neon Auth. The Furniture API still owns profiles, roles, carts, addresses and orders. Protected Axios calls attach the short-lived Neon JWT; public catalogue calls do not request a session. Tokens are held by the SDK in memory and are never written to local storage.

Set these public build variables together. Vite embeds them at build time, so redeploy Vercel after changing them.

Develop (Vercel Preview scoped to develop):

```dotenv
VITE_API_URL=https://furniture-api-develop.furniture-backend.workers.dev/api
VITE_NEON_AUTH_URL=https://ep-misty-glitter-b227v2og.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth
```

Production (Vercel Production only):

```dotenv
VITE_API_URL=https://furniture-api.furniture-backend.workers.dev/api
VITE_NEON_AUTH_URL=https://ep-summer-dust-b2zxwi0y.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth
```

For local development use the develop Auth URL in ignored `.env.local`. Use the develop API once its Neon backend changes are deployed, or point `VITE_API_URL` to a local backend running `AUTH_PROVIDER=neon` with the same develop Auth URL and database. Restart Vite after editing environment files.

On this workstation, ignored `.env.development.local` points to `http://localhost:5000/api`. Run `npm run dev:develop` in the backend, then `npm run dev` here and open `http://localhost:5173/auth`. The backend command reads the ignored `.env.develop`, which contains the develop database and Neon Auth configuration. This local override is not loaded by production Vite builds.

Before releasing the frontend, apply the backend identity migration and deploy its matching Neon Auth configuration. A legacy Worker will not accept Neon bearer tokens. Do not put database URLs, signing secrets or email credentials in Vite variables.

The stable develop frontend is `https://furniture-client-git-develop-cybug-devs-projects.vercel.app`. Neon requires each generated Vercel preview domain to be registered separately; its domain validation does not support a wildcard inside a hostname label. Do not allow `*.vercel.app`. Localhost is enabled for develop only.

Account creation sends one six-digit verification code and shows the verification form. Codes expire after five minutes and Neon invalidates a code after three failed verification attempts. Sign-in does not automatically send another code; an unverified user can request one explicitly. The client allows three successful resend requests in a rolling five-minute window with a one-minute cooldown between requests, while Neon's service-level limiter remains the protection against direct API abuse. A successful login also loads `/api/auth/me`; backend outages are shown as failures rather than falsely reporting a completed login. Logout clears private React Query data. Password recovery and social sign-in UI remain outside this change.

Develop and production use Neon's shared email delivery provider for managed OTP messages. The backend Gmail provider remains available for the separate legacy authentication fallback and is not called by Managed Neon Auth.

Neon uses Secure, HttpOnly session cookies. Browser third-party-cookie restrictions still need testing, especially Safari. For production, configure a supported same-site Auth proxy/custom domain before claiming cross-browser session reliability. A JWT already issued before sign-out remains valid until it expires.

Checks: `npm run test:auth`, `npm run test:commerce`, `npm run build`. Tests mock transport using the actual installed Neon SDK, including its thrown error behavior and session cache. They do not prove inbox delivery or browser cookie persistence; verify those with a real account before release.
