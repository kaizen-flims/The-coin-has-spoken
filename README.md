# The Coin Has Spoken

A tactile, offline coin toss for two choices. No dependencies, account, network assets, analytics, or build step.

**Live app:** https://kaizen-flims.github.io/The-coin-has-spoken/

Enter choices for Heads and Tails, then tap **Toss the coin** or flick the coin upward. A cryptographic 50/50 draw determines the result before animation; the strength of a flick changes only its flight. Toss history, the two choices, and sound preference stay on your device.

## Install for offline use

Open the live app in Android Chrome while online and choose **Install app** from Chrome's menu. Let the first load finish before switching to airplane mode. Its service worker stores every required file locally. The app also works in a browser tab; opening `index.html` as a `file://` URL cannot activate the service worker.

## Run locally

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080/. There is no package installation or build step.

## Run checks

```sh
node tests/smoke.mjs
node tests/interaction.mjs
node tests/offline.mjs
```

The [GitHub Pages workflow](.github/workflows/pages.yml) runs these checks and deploys the `dist` folder on each push to `main`.

## Code map

- `dist/motion.js` — timed 3D flight, impact, bounce, reduced motion.
- `dist/random.js` — independent 50/50 selection.
- `dist/audio.js` — local Web Audio metal synthesis.
- `dist/gesture.js` — tap and upward flick.
- `dist/state.js` — local choices, counts, recent tosses, sound preference.
- `dist/sw.js` — asset precache and offline fallback.
- `tools/generate_assets.py` — generates the already included engraved faces and icons.
