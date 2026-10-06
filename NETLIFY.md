# Deploy Safar Local on Netlify

Use the repository-root `netlify.toml`. It configures:

- Base directory: `safar-local`
- Build command: `pnpm run build:hosted`
- Publish directory: `dist-hosted` (relative to the base directory)
- Node.js: 22

The hosted build is deliberately lightweight. It does not run `dev`, `setup:ai`, or model setup scripts. Model weights, public WASM files, and large inference libraries are excluded. Model preparation remains disabled; bundled phrases, Everyday Culture, records, the trial, and Maps remain available.

For a manual deploy, run these commands from `safar-local`:

```sh
pnpm install --frozen-lockfile
pnpm run build:hosted
```

Upload **only the contents of `safar-local/dist-hosted`**, including its `index.html`, `_redirects`, `_headers`, and `assets` directory. Do not upload the repository or the source `safar-local/index.html`: that HTML imports JSX which browsers cannot run without the Vite build.

The site opens at `/`. The included SPA rewrite also serves the app for nested URLs such as `/safar-local/`. Navigation uses hash URLs such as `/#talk` and `/#culture`.

The original evaluation JSON files are absent from the public repository. The AI page shows that the reports are unavailable; it displays the original results only when both artifacts are supplied. No evaluation numbers are invented.

## Verification

The production hosted build was checked at `/` and `/safar-local/#model`; both render, and model preparation is disabled. The build contains about 650 KB of files without model weights or inference runtimes.

The available non-model test suite currently has 29 passing checks and two pre-existing demo-count failures in `engine.test.js`. `model-map.test.js` and `translation-tokenizer.test.js` require missing evaluation data and local model files. These unrelated tests are not required to create the hosted build.
