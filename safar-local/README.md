# Safar Local

A local React + Vite PWA for small tourism operators: understand visitor requests, review evidence, test one affordable paid experience, and record whether to repeat, change or stop. No backend or public hosting is required.

## Run and demonstrate

Use Node 20.19+ or 22.12+, `pnpm install`, `pnpm build`, then `pnpm preview --host 127.0.0.1 --port 5173`. Keep the same origin for saved records and downloaded packs. Development mode is available with `pnpm dev`, but the production preview is needed for offline use.

Open the app while connected to the local server and wait for **Offline Ready**. Model preparation is explicit: large packs do not download automatically. Browser storage can be evicted or cleared; it is not a durable backup.

1. **Home → Open Noor’s trial:** follow the fictional six-party journey, review evidence, set practical limits, approve an offer and record the outcome. The example uses three attendees, PKR 1,800 received and PKR 1,450 recorded costs, leaving PKR 350. These are illustrative assumptions, not field revenue.
2. **Talk:** prepare the desired model once, start a conversation and try unfamiliar English/Urdu wording. See the original, the independent intent classification, translation draft, model and execution time.
3. **Culture:** the shared WebGPU model rewrites wording from a relevant local note. Source context stays visible, and checks fall back when a key boundary is lost. Everyday guidance works without a model.
4. **Maps:** the local business profile, coordinates and meeting instructions remain available offline. Map imagery is online and opt-in. The default pin is illustrative and does not publish a listing.
5. **Learn / Visitors:** inspect all saved conversations and their original words. Sample records are included, so counts do not establish real demand.
6. **About the pilot:** review the proposed buyer, delivery model, field measures and limits. This is a business hypothesis, not an established partnership.

## Device policy and models

| Purpose | Model and runtime | Device rule |
| --- | --- | --- |
| Shared translation / Culture | Qwen3.5 4B, MLC q4f16_1, WebLLM 0.2.85; 2.39 GB optional pack | At least 8 GB reported RAM, working WebGPU and shader-f16 |
| Compact translation | OPUS-MT English–Urdu / Urdu–English, int8 ONNX; about 144 MB per direction | CPU / WASM, including smaller or unknown-memory devices |
| Small Culture text assistant | SmolLM2 135M, q4 ONNX; about 184 MB | CPU / WASM below the GPU threshold |
| Visitor intent | Quantized MiniLM encoder plus Safar’s trained 12-class logistic head; about 23 MB weights, 46 MB including runtime | CPU / WASM; English only |
| Optional photo description | SmolVLM 256M q4; about 268 MB plus shared runtime | Eligible WebGPU devices, explicit opt-in |

The 8 GB threshold is the requested product policy, not evidence of compatibility with every 8 GB phone. Physical rural Pakistan handset testing remains outstanding. Unknown memory uses CPU. No GPU adapter is requested below the threshold. GPU/runtime failure keeps originals and offers a retry or a smaller mode; no cloud fallback exists.

The WebLLM model is loaded in shards with a 1,024-token working context and no reasoning generation. Talk and Culture share its files and service. Requests run sequentially in a worker, with cancellation, bounded output and timeouts. GPU memory is released after one minute idle or on leaving a feature. Context is reset between requests; unrelated visitor conversations are never added to the prompt.

Forty recent translation results can be reused in memory, keyed by backend, source language and text. Forty-two authored phrase pairs are instant. General text is split into small sentence chunks; overlong input and unfinished output produce retryable errors. Number, day, time-of-day, negation, output-script and repetition checks catch some errors. Warnings remain visible until the wording is reviewed. These checks do not establish semantic accuracy. Models can still change meaning. Check important details with the speaker.

Culture uses English source-note retrieval and constrained rewriting. It does not infer a person’s religion, ethnicity, intentions, consent or safety. Urdu Culture generation and Roman Urdu input remain unvalidated. Photo description is experimental, transient and not a source of cultural claims.

## Records, consent and decisions

Talk records store original words, message role, timestamp, language, translation draft/provenance, intent suggestion and rule-based topic/feedback fields. Conversations stay in this browser’s localStorage. The app neither uploads them nor automatically retrains a model. Culture inputs and outputs, photos and audio recordings are not saved. Browser speech services may process speech online.

All saved conversations are included in Home, Learn, exports and live trial evidence. Existing records are preserved, including records with older practice or review labels. Sample conversations retain their source label. Counts are conversation records, not verified unique people, bookings or willingness to pay. Review original words before making business decisions.

Each Talk translation can be reviewed or corrected after checking with the speaker. The original words, first translation draft and model provenance stay in the record. Reviewed wording is labeled separately and never used for automatic training.

Settings can export all saved conversations as a private JSON file. The prototype does not import backups. Per-conversation deletion and Delete all local data remove records and their derived insights. Model packs are separately removable. Human review is required before copying a trial offer; the app makes no bookings, payments or external messages.

## Reproduce model assets

All browser model and runtime requests target the same local origin. Pinned repositories, revisions, file sizes and SHA-256 hashes for the shared pack are in `src/model/shared-llm-manifest.json` and the local pack’s provenance file.

- `python scripts/prepare-shared-llm.py`: downloads the pinned MLC weights and GPU library. Local paths include `/resolve/<revision>/` because WebLLM expects this layout.
- `python scripts/download-model.py`: downloads the intent encoder assets.
- `python scripts/download-culture-models.py`: downloads CPU Culture and optional vision assets.
- `python scripts/prepare-translation.py`: prepares the compact translation graphs. Requires ONNX, SentencePiece and NumPy; local graph-merging helpers carry their upstream license.
- Shared ONNX runtime files are provided in `public/wasm`. Large model binaries should be distributed separately from a source-only submission archive.

Models retain Apache-2.0 notices and provenance. Sources: [Qwen3.5 4B MLC](https://huggingface.co/mlc-ai/Qwen3.5-4B-q4f16_1-MLC), [WebLLM](https://webllm.mlc.ai/), [MiniLM](https://huggingface.co/Xenova/all-MiniLM-L6-v2), [SmolLM2](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct), [SmolVLM](https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct), [OPUS English–Urdu](https://huggingface.co/Helsinki-NLP/opus-mt-en-ur), [OPUS Urdu–English](https://huggingface.co/Helsinki-NLP/opus-mt-ur-en).

## Evidence and limits

Run `pnpm test` and `pnpm build`. The trained intent classifier used 120 synthetic English training, 24 development and 36 held-out test examples, with related bilingual pairs kept together. It achieved 33/36 raw correct and 28/29 accepted correct, abstaining on 7. These small internal results are not field accuracy and say nothing about translation quality. See `data/semantic-evaluation.json`.

Rejected candidates are retained as evidence: Qwen3 0.6B CPU tests and Qwen3 1.7B WebGPU tests showed significant Urdu meaning errors. The Qwen3.5 2B candidate also changed meaning in two browser checks. The large ONNX 1.7B file failed browser initialization, motivating the sharded WebLLM loader. Retired model files are outside public assets in the local development workspace. Compact OPUS-MT also has known semantic errors and remains a labeled draft option.

Final WebGPU browser checks, including observed meaning errors, Culture output and cached execution with the local server stopped, are recorded in `data/final-browser-validation.json`. All 37 automated checks and the production build pass. These checks validate software behavior, not general translation accuracy.

Noor is a fictional challenge persona. Six parties, costs and outcomes are authored demonstration data. Urdu and PKR illustrate localization; the coffee-farm story is not a field study of rural Pakistan. No submission, publication, customer acquisition, income improvement or independent language validation is claimed.


## Hosted demonstration without downloadable models

Run `pnpm build:hosted` and deploy **dist-hosted**, not the full local `dist`. This separate build excludes public model packs and the public WASM folder, displays an app-wide hosting-limit notice, and disables model preparation. Everyday Culture, authored translation phrases, local records, the trial and opt-in Maps remain available. The notice includes localhost instructions. Normal `pnpm build` retains the full local AI version. Hosting does not transfer existing localhost records or model caches. This command only prepares files; it does not publish them.
