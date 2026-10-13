# DST Logo Voting App

Nuxt 3 SPA for internal DST logo submissions and voting. Uses Firebase (Auth, Firestore, Storage) and deploys to GitHub Pages.

## Local development

1. Copy `.env.example` to `.env` and fill in your Firebase web app config.
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

## Firebase setup

1. Create a Firebase project with **Google sign-in** enabled.
2. Restrict the OAuth client to your `@dst.com.bn` Google Workspace domain (and add `localhost` to authorized domains for local dev).
3. Deploy security rules:

   ```bash
   firebase deploy --only firestore:rules,storage
   ```

4. Enable Firestore and Storage in the Firebase console.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which runs `nuxt generate` and publishes `dist/` to the `gh-pages` branch.

Set these GitHub repository secrets for the workflow:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## Configuration

- **Voting deadline:** `app.config.ts` → `countdown.target` (ISO 8601, Brunei time UTC+8).
- **GitHub Pages base path:** `nuxt.config.ts` → `app.baseURL` (default `/logo-voting-app/`).
