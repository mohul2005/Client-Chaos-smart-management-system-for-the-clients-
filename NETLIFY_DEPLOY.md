# Deploying this project to Netlify

This project is already configured for Netlify via `netlify.toml`.
You only need to connect it and add two environment variables.

## 1. Connect GitHub to this project
Use the "Connect GitHub" button in the chat. Readdy creates a repo and
pushes the code to it.

## 2. Create the Netlify site
- Go to https://app.netlify.com
- Click **Add new site** -> **Import an existing project**
- Choose **GitHub** and pick the repo Readdy created

## 3. Build settings
`netlify.toml` already sets these, but confirm them if Netlify asks:
- Build command: `npm run build`
- Publish directory: `out`

## 4. Environment variables (IMPORTANT)
Go to **Site configuration -> Environment variables** and add:

| Key | Value |
| --- | --- |
| `VITE_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon (public) key |

You can copy these values from the project's `.env` file.
Without them, login and all workspace data will not load.

## 5. Deploy
Click **Deploy site**. Netlify runs `npm run build` and serves the `out` folder.

## Notes
- SPA routing is handled: refreshing on `/login`, `/app/board`, etc. works.
- Every time you push from Readdy, it updates the repo and Netlify rebuilds.
- Do not hand-edit files on GitHub; the next push will overwrite them.