# Repository Guidelines

## Project Structure & Module Organization
The root `index.html` handles the automatic redirect to the weekly Notion timetable. Visual styles for legacy timetable views live in `css/`, along with shared background assets. The interactive mini-game resides under `game/`; its entry document pulls CreateJS-driven behavior from `game/static/index.js` and loads UI/music assets from the adjacent `static` subfolders. Keep large binaries (backgrounds, music) in the existing paths so relative references remain valid.

## Build, Test, and Development Commands
Use a lightweight static server to preview everything locally: `python3 -m http.server 4000` (run from the repo root) or `npx serve .` if Node is available. Visit `/game/` while the server runs to exercise the arcade view. No bundler is required—just edit HTML/CSS/JS directly and refresh.

## Coding Style & Naming Conventions
Follow the prevailing formatting in each file: four-space indentation for HTML/CSS and standard two-space blocks for JavaScript logic. Keep IDs/classes descriptive (e.g., `GameScoreLayer`, `btn_group`); new selectors should mirror this camel-cased style to match existing scripts. Avoid introducing new libraries unless they can be loaded via CDN like the current Bootstrap 4 and CreateJS includes.

## Testing Guidelines
There is no automated harness, so rely on manual verification: reload the static server, ensure the redirect page still jumps to Notion, and test `/game/` on both desktop and mobile breakpoints (the JS swaps layout rules via `isDesktop`). Check the browser console for errors and confirm audio cues (`tap`, `err`, `end`) fire correctly. When modifying assets, confirm cache-busting or filenames to keep references intact.

## Commit & Pull Request Guidelines
Recent history favors single-purpose commits titled “Update <file>”; keep that concise, present-tense style. Each PR should describe the change scope, list manual test steps, and attach screenshots or short clips for visual updates (especially gameplay or timetable styling). Reference related Notion tasks or GitHub issues when available, and note any CDN/script additions so reviewers can confirm their availability.

## Security & Configuration Tips
Do not commit sensitive Notion links beyond the existing public ones, and avoid embedding untrusted external scripts. Large new assets should be optimized (e.g., compress `.png` or `.mp3`) to keep the GitHub Pages load fast. If swapping CDNs, prefer HTTPS endpoints with strong uptime guarantees.
