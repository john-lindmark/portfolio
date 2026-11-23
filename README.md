# Lindmark Design

Portfolio site for [lindmark.design](https://lindmark.design), built with Next.js
(App Router) as a fully static export.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

- `components/Experience.tsx` runs the page transitions. The Winged Victory
  (`components/Statue.tsx`) lives in the root layout, so it stays loaded across pages.
- `components/HomeNav.tsx` holds the hidden links under the home logo.
- `components/timing.ts` holds the transition timings.
- `app/globals.css` holds all styles; `public/` holds the model, images and favicons.

Pushes to `master` deploy via `.github/workflows/deploy.yml`. GitHub Pages must be set
to deploy from **GitHub Actions** (Settings → Pages → Build and deployment → Source).
