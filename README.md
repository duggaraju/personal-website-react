# Personal Website React

[![Website duggaraju.com](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](https://duggaraju.com)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/duggaraju/personal-website-react/blob/master/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/duggaraju/personal-website-react.svg)](https://github.com/duggaraju/personal-website-react/graphs/contributors/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/duggaraju/personal-website-react/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

A clean, responsive, single-page webapp template for developers. View demo at [jolienhoop.com](https://jolienhoop.com)

- built using [React](https://reactjs.org/)
- bundled with [Vite](https://vite.dev/)
- styled with [Material UI](https://mui.com/)
- original template demo hosted at [jolienhoop.com](https://jolienhoop.com)

Kudos to [Cody Bennett](https://github.com/CodyJasonBennett), [José Coelho](https://github.com/jcoelho93) and [Brittany Chiang](https://github.com/bchiang7) for the inspiration.

## Features

- All of the personal information is populated from [resume.json](src/settings/resume.json) following the [JSON Resume](https://jsonresume.org/) standard, a community driven open source initiative to create a JSON based standard for resumes. See the [official resume schema](https://jsonresume.org/schema/).
- The toggle/switch for the dark mode syncs its state to the local storage.
- Reduced-motion preferences disable animation, and themed static sphere images provide a lightweight fallback when WebGL 2 is unavailable.
- The resume includes a Home link and a print-friendly layout with a print / save-as-PDF button.
- Patents and published applications use a compact table on desktop and in print, with stacked rows on mobile. Matched grants replace earlier application publications in the display; unmatched applications remain visible. Publication links open Google Patents.

### Feature TODOs

- [ ] Add clear Home / Resume / Projects navigation across the site (the resume already has a Home link).
- [ ] Add a direct PDF resume download (printing and browser Save as PDF are available).
- [ ] Publish selected project case studies with roles, technical decisions, measurable outcomes, and links.
- [ ] Add articles and talks about video, streaming, and content provenance.
- [ ] Add route-specific social previews and structured profile metadata using JSON-LD.
- [ ] Confirm resume facts: Microsoft display dates (2005 - Present) disagree with structured dates (2013 - 2014); education display dates (1997 - 1999) disagree with structured dates (2011 - 2013). Confirm Seattle vs. Bellevue and Gmail vs. Outlook contact preferences. Replace placeholder experience summaries and verify the "Started the company" highlight. Spelling and prose have been reviewed.
- [ ] Establish a reliable scheduled patent refresh after validating the manual browser scraper end to end against the live service. The scraper retains cached data on failure, but live validation encountered USPTO HTTP 429. The [USPTO transition guide](https://data.uspto.gov/support/transition-guide/patentsview) reports PatentSearch API interruptions and no launch date for replacement functions (checked September 17, 2026); ODP bulk datasets are an alternative requiring a separate import process and ODP credentials. Keep any future API credentials in CI secrets.
- [ ] Add reviewed Playwright visual baselines for each page, theme, and viewport, using a pinned browser and OS. Freeze or mask animation and other dynamic content; keep canvas animation checks separate. Start with ordinary Git and consider LFS if image history becomes large. Document explicit baseline updates and review expected/actual/diff artifacts in CI.

## Customization

Feel free to fork this project and customize it with your own information and style.

Refer to the [Material UI docs](https://material-ui.com/customization/theming/) for guidance on how to quickly customize the themes, components and colors to suit your tastes.

If you improve the app in any way a pull request would be very much appreciated ✌️

## Available Scripts

In the project directory, you can run:

### `npm run patents:update`

Preview patent records using the public [USPTO search](https://ppubs.uspto.gov/basic/).
Requires Node 24, installed dependencies, and Chromium (`npx playwright install chromium`).
No API key is needed. The script searches the inventor surname and checks each
document against the owner's confirmed names: Prakash Duggaraju, Krishna Prakash
Duggaraju, and Krishna Duggaraju. Other inventor names are excluded.

Use `npm run patents:update -- --write` to update the cached records in
[resume.json](src/settings/resume.json), then review the diff before publishing.
Missing existing records block writes unless `--allow-removals` is also passed;
only use that flag after manually reviewing every removal. Errors, incomplete or
paginated results, and rate limits leave the cache unchanged. Do not retry in a
loop after HTTP 429. Public-site layout changes may require script maintenance.
The script stores Google Patents links, not session-bound USPTO document URLs.

The September 17, 2026 snapshot contains 20 records: 19 captured USPTO search
results plus the existing US-8621044-B2 record cross-checked on Google Patents.
It includes 10 grants and 10 published applications, not 20 distinct inventions.
Titles, publication numbers, and dates were checked in search results; selected
documents were checked individually. Full document-by-document USPTO validation
was interrupted by rate limiting, and portfolio completeness is not established.
Source and verification details are recorded with the cached data.

The resume displays 11 rows: 10 grants and one unmatched published application.
Nine application-to-grant relationships were checked against patent document
and Google Patents version metadata on September 17, 2026. The reviewed
`patents.publicationGrants` mapping hides an application only when its matching
grant is also cached. Separate grants with identical titles remain visible, and
all 20 records remain in the cache. The refresh script preserves this mapping
but does not discover new relationships; review it when refreshing records.

Run `npx playwright test tests/patents.spec.mjs --project=desktop` for offline
scraper checks covering confirmed names, rate limits, incomplete results, and
document-title mismatches. These tests do not contact USPTO.

### `npm install`

to install the dependencies.

### `npm start`

to run the app in development mode at [http://localhost:5173](http://localhost:5173).

The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### `npm test`

Install the browser once with `npx playwright install chromium`, then run
`npm test`. The Playwright suite starts an isolated Vite server on port 5174
and checks desktop (1440 x 900) and mobile (390 x 844) in both themes.
It covers home rendering, nonblank animated WebGL output, theme persistence,
resume navigation, resume sections, images, contact links, and overflow.
Generated screenshots are saved in `screenshots/checks`; failure traces and
screenshots are saved in `test-results`. These artifacts are ignored by Git.

The suite also checks missing-page routing, return-home navigation, and mobile
social links. Application console warnings and errors fail tests; only Chromium's
specific GPU ReadPixels capture-driver warning is excluded. There are no expected
failures. The mobile-only menu test is skipped in the desktop project.

Fallback checks cover reduced motion (including live preference changes), theme
switching, unavailable or throwing WebGL initialization, context loss, and failed
image loading. Reduced motion uses a static sphere and disables text scrambling.
The themed desktop/mobile WebP backgrounds total approximately 54 kB; only the
matching variant loads. Regenerate them against a running production preview with
`node scripts/capture-backgrounds.mjs` (default URL: `http://127.0.0.1:5175`,
overridable through `SITE_URL`).

To test production output locally, run `npm run build`, set `TEST_PRODUCTION=true`
in your shell, and run `npm test`.

### Publishing

Commit all source changes, the lockfile, tests, and `public/backgrounds` assets,
then push to `master`. The Azure GitHub Actions workflow installs dependencies
with `npm ci --engine-strict` on Node 24, builds the site, copies the SPA routing
configuration into `build`, and runs Chromium desktop/mobile tests against that
production build. Deployment uploads the verified output only after tests pass;
Azure's automatic application build is disabled. Test evidence is retained for
seven days in GitHub Actions artifacts.

Pull requests targeting `master` use the same checks and Azure preview deployment.
The existing Azure deployment-token secret must remain valid. Local validation
does not verify that secret, custom-domain configuration, or the hosted Linux
runner. No push or cloud deployment is performed by the local checks.

Screenshots currently serve as inspection artifacts, not visual regression
baselines. The feature TODO above tracks adding native Playwright screenshot
assertions and reviewed baseline updates.

### Dependency Requirements

Use Node.js 24.x (build and browser tests verified with Node.js 24.19.0).
Older Node.js release lines are not supported by this project.
Vite is kept on the latest stable 8.2 patch line; the registry's newer `latest`
tag pointed to an 8.3 beta during this upgrade. Other direct packages use their
latest stable releases as checked in September 2026.

The upgraded Three.js renderer requires WebGL 2. Its custom Phong shader hooks
preserve the original noise effect, legacy light intensity, and unconverted
fragment output. Validate the background in a browser after future Three.js
updates; a production build alone does not compile GPU shaders.
