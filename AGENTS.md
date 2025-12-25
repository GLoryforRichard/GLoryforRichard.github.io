# Repository Guidelines

## Project Structure & Module Organization
`index.html` hosts the Minimalist Tag-Link Hub shell plus the configuration modal markup. All styling lives in `assets/style.css`, which defines the light/dark design tokens, responsive grid, and palette widgets. Behavioral logic is contained in `assets/app.js`; it fetches `data.json`, drives filtering, search, dark-mode persistence, toast feedback, and the JSON studio flows. Bookmark content and tag colors are strictly stored in `data.json`, making it the single source of truth for deployments.

## Build, Test, and Development Commands
Serve the site locally with any static server, e.g. `python3 -m http.server 4173` or `npx serve .` from the repo root, then visit `http://localhost:4173/`. No bundler is required, but remember that `fetch('./data.json')` obeys CORS rules, so use an HTTP server instead of `file://` previews.

## Coding Style & Naming Conventions
Stick to four-space indentation for HTML, CSS, and JavaScript. Favor semantic class names (`card-grid`, `config-overlay`, `tag-filter`) and keep new JS in plain ES modules without external dependencies. When extending UI components, wire color tokens through CSS variables so dark mode stays consistent, and gate dynamic text insertion through DOM APIs to avoid XSS.

## Testing Guidelines
Manual QA is mandatory: (1) load the page in both light and dark themes, verifying persistence after refresh; (2) add/remove tag filters and confirm multi-select AND logic; (3) use the search box (⌘K / Ctrl+K shortcut) to validate real-time filtering; (4) open the config studio, add a tag with the color swatches, add a link, and confirm the JSON export updates; (5) check copy-to-clipboard actions and the GitHub edit links; (6) resize to mobile widths to verify grid collapse and modal usability. Watch the console for `fetch` failures or clipboard permission warnings.

## Commit & Pull Request Guidelines
Favor descriptive summaries such as “feat: add tag palette modal” or “fix: debounce search input.” PRs should link the relevant PRD/issue, outline manual test steps (covering both modes and filters), and include before/after screenshots or screen recordings for UI-touching changes. If `data.json` is updated, highlight the new tags/links and remind reviewers to redeploy GitHub Pages.

## Security & Configuration Tips
Only consume trusted CDNs (Google Fonts today) and keep third-party scripts to a minimum to preserve the zero-backend promise. Ensure `data.json` contains public-friendly URLs; secrets or private Notion links should never be committed. Optimize imagery/favicon assets and purge unused binaries to keep Pages builds fast.
