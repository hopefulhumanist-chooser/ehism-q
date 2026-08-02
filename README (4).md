# EHISM-Q

Existential Hyperion Interconnected Sequoia Mindfulness Questionnaire
*Explore · Expand · Become*

A self-contained reflective questionnaire, arranged as a tree grows (Roots → Growth → Canopy → Grove), with a closing "Rings" screen that mirrors an aspirant's own marks and written answers back to them — no scoring, no personality categories, just their own words reflected.

## About this project

I designed and wrote all the survey questions myself. The application code
was built with AI assistance (Claude) based on my specifications and
direction — I did not hand-write the implementation.

This means:
- Review the code before relying on it in production, especially around
  data handling and validation.
- The survey logic and question design reflect my own work; the code
  that runs it does not.

## Running locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Building

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes automatically on every push to `main`.

To turn it on:

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**, and under "Build and deployment," set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow builds and deploys automatically. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

**Important:** open `vite.config.js` and set `base` to match your repo name, e.g. `base: "/ehism-q/"`. If your repo is named something else, change it to `"/your-repo-name/"`. If you're deploying to a user/org site (`https://<username>.github.io/`) instead of a project site, set `base: "/"`.

### Manual deploy (alternative)

If you'd rather not use the Actions workflow:

```bash
npm run deploy
```

This uses `gh-pages` to push the built `dist/` folder to a `gh-pages` branch. You'd then point Pages at that branch under **Settings → Pages → Source → Deploy from a branch**.

## Notes

- Responses are saved to `localStorage` in the visitor's own browser — nothing is sent anywhere, and different visitors on the same deployed site won't see each other's answers. Clearing browser data clears responses too.
- Fonts (Fraunces, Spectral, JetBrains Mono) load from Google Fonts at runtime.
- Icons via [lucide-react](https://lucide.dev/).

## Structure

```
├── index.html
├── main.jsx           # React entry point
├── App.jsx            # the entire app
├── vite.config.js
├── public/            # home-screen icon, favicon, manifest.json
└── .github/workflows/deploy.yml
```

## Home screen icon

The `public/` folder contains icons generated from the original handwritten survey photo — this is what shows up if someone visits the site on their phone and taps "Add to Home Screen" (iOS Safari) or gets the install prompt (Android Chrome). It isn't a literal app-store download; it's a bookmark that behaves and looks like an installed app, icon and all.
