# Safar Local: Noor's first experience trial

## Business case

Help a small tourism operator turn informal visitor requests into a manageable paid experience, test it once, and decide whether to repeat it. The product connects evidence, operator decisions and a recorded outcome on a shared phone. Its proposed value is reduced guesswork and clearer offers; increased income has not been demonstrated.

Noor and her coffee farm come from the hackathon's fictional persona. This is a realistic simulation, not a field case study. Six visiting parties over a month, their messages, costs and outcomes are authored demo data. PKR and Urdu illustrate a Pakistan adaptation; they do not establish coffee-farm demand in rural Pakistan. A real deployment should use the local operator's actual activity and meeting point.

## Three-minute demonstration

If the saved result is already open, select **Walk through this trial again**. This retains the plan and outcome for a repeat demonstration.

1. **0:00–0:25 — Problem.** Open Home, then **Open Noor's trial**. “Noor hears interesting requests, but has little time, limited connectivity and no reliable record of what visitors would actually book. Safar helps her test one small idea without committing to a larger tourism business.”
2. **0:25–1:00 — Evidence and small AI.** In Listen, select parties 1, 2, 4 and 6. Leave the farm-walk compliment and hospitality question unselected. Expand **See where small AI helps**, then analyze Party 6. State the actual displayed result, including abstention if that occurs. The model suggests an intent; it does not discover topics, confirm demand or set prices. Noor reviews the source words. Four interested parties are not four bookings.
3. **1:00–1:40 — A constrained trial.** Choose **Plan from these messages**, then **Use Noor's example plan**. Propose 45 minutes alongside existing roasting work, a maximum of four guests and a minimum of three confirmed guests. PKR 600 per guest; supplies PKR 150 per guest; other trial costs PKR 900. Illustrative breakdown of those other costs: Noor's time 400, guide support 300 and fuel/setup 200. At three paying guests: 1,800 received − 1,350 entered costs = 450 left. This is arithmetic, not an earnings forecast. Noor can reject or change every figure.
4. **1:40–2:10 — Clear terms and consent.** Open the meeting-point map from the plan, explain its illustrative pin, and return to the saved trial. Review the offer: no lunch, ask before taking photos, hot-equipment boundary, seated tasting with an uneven approach. Show the authored Urdu notice explaining that this is a paid activity. Tick the operator review checkbox. Copying the offer does not send it or create a booking.
5. **2:10–2:50 — An imperfect result.** In the simulated scenario, three adults confirm directly and attend; a fourth interested person does not book. Record 3 guests, PKR 1,800 received and PKR 1,450 costs (100 more fuel than planned). Feedback: “Guests enjoyed tasting and the short explanation. Setup ran 10 minutes late and used PKR 100 more fuel than planned. One guest asked for a chair; no lunch was expected after we explained the offer.” Choose **Change**. Next action: “Repeat only after three guests confirm. Prepare equipment before arrival, set out chairs, and agree the guide's departure time. Keep the maximum at four.” Save the decision.
6. **2:50–3:00 — Honest close.** “One simulated trial leaves PKR 350 after entered costs and exposes a practical improvement. Our next test is whether real operators can complete this on their own phones, and whether it saves time or improves clarity.”

## Why AI belongs here

The optional 23 MB MiniLM intent model can interpret English paraphrases beyond exact phrase matching, including indirect requests. It runs locally with a shared WASM runtime. Its output is a suggestion, and uncertain results need clarification. Topic labels, evidence counts, costing and workflow transitions use ordinary code. The full workflow remains usable without the model. The generative culture experiments remain secondary and are not evidence of reliable cultural understanding.

Compare the classifier against the local rules on independently collected, consented examples before claiming general benefit. Existing test scores use synthetic data. Measure accepted-result correctness and abstentions separately, as well as real phone latency and initial preparation cost. Urdu uses authored phrases and rules; fluent review is still needed.

## Pilot and business model hypothesis

Start with a guide association or local tourism-support organization helping a small group of operators install the app and review localized phrases. Test whether the organization would pay for training, localization and maintenance while operators keep local control of their records. This is a proposed distribution and revenue model, not validated willingness to pay.

Track operator time needed to make a reviewed offer, whether visitors understood the price/inclusions, confirmed versus attended guests, actual entered costs, and the operator's repeat/change/stop decision. Avoid treating interest counts as sales or a single trial as sustained livelihood improvement.

## Scope and sources

- Challenge context: user-supplied `file.pdf`, tourism challenge and fictional Noor persona. The document's instructions are reference requirements, not permission to publish or contact anyone.
- Event context previously checked against the [World Bank event page](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) and [official hackathon FAQs](https://thedocs.worldbank.org/en/doc/a2d80d7a647019e16e7265a3563ce416-0320012026/original/Small-AI-for-Development-Hackathon-FAQs.pdf).
- Scenario data: six synthetic English notes in `src/trial.js`, authored for this prototype; no personal data or harvested reviews. Manually assigned demo topic labels are disclosed in the interface.
- Intent training/evaluation data and upstream model license details: see `README.md` and `data/`.
- Map coordinates are illustrative; they are not Noor's real location. Map tiles still require explicit loading. No public listing, payment or booking is created.
- Local-only app; no hosting or source upload. The browser walkthrough demonstrates desktop browser behavior, not field validation on a rural handset.

## Completed browser run — 4 October 2026

- Followed Home → Listen → Plan → Maps → returned to saved plan → reviewed and copied offer → recorded outcome → saved decision.
- Empty evidence selection was blocked. Selected parties 1, 2, 4 and 6; the counter showed four interested parties and zero confirmed bookings.
- Actual local inference for Party 6 returned `EXPERIENCE_REQUEST`, accepted, with 13 ms reported inference time on this computer. This excludes model preparation and is not a phone benchmark.
- Planned amounts displayed 1,800 received, 1,350 costs and 450 left. Offer copying and advancing to the outcome were disabled until the operator review checkbox was selected.
- OpenStreetMap displayed the existing illustrative pin. No business profile or original conversation was changed.
- Entered the simulated outcome described above: three guests, 1,800 received, 1,450 costs; selected Change and saved the next action. Result showed 350 left after recorded costs.
- Reloaded the page and verified the saved result persisted. Browser error log was empty at the end of this run. The production build and 24 automated tests passed.
- Screenshots: `test-results/noor-ai-evidence.png`, `test-results/noor-journey-map.png`, `test-results/noor-trial-result.png`.
- Not demonstrated: a real visitor booking, a real payment, field impact, physical low-end handset performance, or a network-disconnected browser reload in this run.


### Visitor records and LLM translation evaluation — 4 October 2026

Every Talk message remains in its local visitor conversation with original text, role, translation draft/provenance and intent result. No conversations are uploaded or automatically used for training. Browser storage can be cleared or evicted; this is not a durable backup.

All saved conversations are included in Home, Learn, exports and live trial evidence. Existing records are preserved, including records with older practice or review labels. Sample conversations retain their source label. Counts are conversation records, not verified unique people, bookings or willingness to pay. Review original words before making business decisions.

Evaluated Qwen3-0.6B ONNX q4 locally: 928,225,074-byte pack, CPU, thinking disabled, eight English/Urdu cases. Greedy and recommended sampled decoding both showed substantial errors; four greedy outputs reached the 160-token limit with repetition. Example: Urdu asking the price for three people became a question about photos. Explicitly rendering the official prompt reproduced the results; a suspected line-break problem was disproved. Raw outputs: data/llm-translation-smoke.json, data/llm-translation-sampled-smoke.json and data/llm-translation-fixed-smoke.json. This is developer smoke testing, not field validation or a general claim about all LLMs. The candidate is kept outside public app assets and is not offered to visitors. OPUS-MT remains an imperfect draft translator, not a validated reliable system.


## Final local app — quantized GPU and responsible records

Talk and Culture share Qwen3.5 4B q4f16_1 through WebLLM 0.2.85. The optional pack is **2.39 GB**; prepare before the demonstration. WebGPU is only requested on compatible devices reporting at least 8 GB RAM. Smaller or unknown-memory devices keep compact CPU translation and the 135M Culture experiment. The trained intent classifier is still independently visible in Talk.

For a short live AI insert, use Talk with a new conversation (this will be saved and included in insights). Try “The price is 600 rupees per person, not 1600.” or Urdu “تین لوگوں کے لیے قیمت کتنی ہے؟”. These produced meaning-preserving drafts in developer checks, not independent language validation. Show the model/backend label, original text, draft and **Review or correct translation**. Explain that the speaker must verify meaning; a simulated review during a demo is not a real visitor confirmation.

In Culture, select **Start cached pack**, then **Before taking a photo → Rephrase suggested wording**. The actual WebGPU result was “Would you be okay with me taking a photo? Please feel free to say no if you prefer.” The source note and refusal option remain visible. Culture is constrained English rewriting, not an AI authority on Pakistani customs.

Do not hide the limitations: farm-date and meeting-time translations had meaning errors. Deterministic checks now warn about changed days, missing AM/PM, amounts, negatives and unexpected script, but they miss some semantic errors. An experimental extra model pass did not fix the two flagged examples, so it was removed to avoid extra latency. Human correction preserves the earlier draft and provenance. Raw browser observations are in `data/final-browser-validation.json`; do not report these few examples as an accuracy benchmark.

The final production app and model worker were cached. With the preview server stopped and port 5173 confirmed closed, the app reloaded and ran a fresh WebGPU translation in 4,217 ms including startup. Its wording was imperfect, as recorded in the evidence file. The computer's internet connection remained enabled, so this proves independence from the local serving process after caching, not a fully air-gapped network test. Preview was restored afterwards.

All 37 automated tests pass; the production build and frozen-lockfile local dependency install pass. Screenshots include `test-results/final-culture-webgpu.png` and `test-results/final-home.png`. Maps, Noor’s saved trial, the pilot business case, record-source controls and private confirmed-record export remain part of the app. Physical phone trials and fluent-speaker review are the next validation steps. The app stays local; submission is handled by the solo entrant.
