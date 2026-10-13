# DST Logo Voting App

Nuxt 3 SPA for internal DST logo submissions and voting. Uses Supabase (Auth, Postgres, Storage) and deploys to GitHub Pages.

## Local development

1. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

## Supabase setup

1. Enable **Google** under Authentication → Providers.
2. Under **Authentication → URL configuration**:
   - **Site URL:** `https://omardst.github.io/logo-voting-app/` (production). If this is left as `http://localhost:3000`, Google sign-in from GitHub Pages will redirect to localhost after login.
   - **Redirect URLs** (add both):
     - `https://omardst.github.io/logo-voting-app/**`
     - `http://localhost:3000/**`
3. Run database migrations in `supabase/migrations/` against your project.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which runs `nuxt generate` and publishes `.output/public` to the `gh-pages` branch.

Set these GitHub repository secrets for the workflow:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Configuration

- **Voting deadline:** `app.config.ts` → `countdown.target` (ISO 8601, Brunei time UTC+8).
- **GitHub Pages base path:** `nuxt.config.ts` → `app.baseURL` (default `/logo-voting-app/`).
