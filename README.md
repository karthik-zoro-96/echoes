# Echoes: Memory Relay

**One moment. Many memories.** Echoes lets people add their own account of a shared moment, keeps each voice side by side, and uses an open-weight model to suggest a gentle follow-up question. Private mode uses local Ollama; a separate judge preview uses a hosted model only with a fixed fictional example. It does not imitate the person being remembered or decide which version is true.

## Private local mode

1. Install [Ollama](https://ollama.com/download).
2. Pull Gemma: `ollama pull gemma3:4b`.
3. Start Ollama: `ollama serve` (if it is not already running).
4. In this directory, start a local web server: `python3 -m http.server 8000`.
5. Open `http://localhost:8000` in your browser.

The **Suggest a question** action sends the saved accounts to `http://localhost:11434/api/generate`. It requires Ollama's local API to allow requests from the page's localhost origin. The model is editable in the interface; any Ollama model compatible with `/api/generate` can be selected. This private path stays on the visitor's device. The cloud sample button is not available from this simple Python server; it becomes available after the Worker is deployed.

## Public judge demo (Cloudflare Workers AI)

The **Try the cloud sample** button uses the Worker endpoint `/api/demo-question`. It sends a bodyless `GET`; the Worker does not read browser storage and builds its model request from a fixed fictional sample in `worker.js`. The page never forwards a visitor's relay to this endpoint. The returned question is labeled as a hosted-model result and cached at the edge for one hour. A Cloudflare rate-limit binding adds a best-effort per-IP limit on cache misses.

This demo uses Cloudflare Workers AI's hosted open-weight Gemma 4 model (`@cf/google/gemma-4-26b-a4b-it`). Cloudflare's current Workers AI docs describe an included 10,000-neuron daily allocation; usage beyond that on a paid Workers plan is metered. **Workers AI calls can incur usage even during `wrangler dev`**, so do not call the hosted endpoint while developing unless you intend to use the Cloudflare account's allocation. Check [current pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) before enabling the endpoint.

After pushing this directory to GitHub and connecting the repository to a Cloudflare account with Workers AI enabled:

1. Install a current Wrangler CLI, or use `npx wrangler@latest`.
2. Run `npx wrangler login` and finish the Cloudflare login in your browser.
3. Review `wrangler.jsonc`; change `ratelimits[0].namespace_id` to an unused integer in your Cloudflare account if needed.
4. Run `npx wrangler deploy` from this directory.

Cloudflare deploys the site assets and Worker together. `wrangler.jsonc` binds Workers AI and rate limiting; `.assetsignore` keeps server files and the submission draft out of the public asset bundle. Do not add a provider key or family data to the repository. `wrangler dev` can also call the hosted model and is metered.

## How it works

- A relay stores a shared-moment prompt and one or more attributed responses.
- Browser `localStorage` keeps the relay on the current browser profile. It is not a shared cloud archive.
- Local Gemma receives user-created relay text and returns one suggested, open-ended question. The fictional starter sample is excluded. The app requires a generated question to reuse a meaningful word from the source text, retries once if it does not, and shows that word as a review aid. This lexical check is not proof that the whole question is factually grounded.
- The hosted judge demo receives only its fixed fictional sample; it never receives visitor-created relays. Its edge cache and per-IP rate limit reduce repeated inference, but the rate limit is approximate and not a strict global spend cap.
- A Markdown keepsake can be downloaded for backup or sharing. The export preserves individual responses and marks the built-in fictional sample as fictional.
- The **Clear memories from this device** action removes saved relays from this browser.

The starter story uses invented characters and is labeled **Fictional example**. You can remove it for a clean personal archive. Get each contributor's permission before recording or sharing their account.

## Why open AI

Family stories are personal. In private mode, a local open-weight model generates questions on a computer the family controls, without sending the archive to a hosted AI provider. The model and prompt can be inspected or changed, and that inference request stays on localhost. The optional judge preview demonstrates hosted Gemma using invented sample text only. The browser sends no relay text to that endpoint. The page uses system fonts and includes no analytics or hosted fonts.

## Honest limits

- The public judge route is not deployed yet. It needs a Cloudflare account with Workers AI enabled. A public website cannot reach each visitor's Ollama automatically; personal relays still require the local setup above.
- Local storage is tied to one browser profile and can be cleared by browser settings. Export the Markdown keepsake for a backup.
- The model can still suggest a question that assumes something not in the stories. The source-word check is deliberately modest; review every suggestion before sharing.
- No audio recording, transcription, user accounts, sync, or encrypted archive is included.
- A local model needs to be downloaded once and requires suitable device resources. After setup, inference can run without a hosted model API.

## Files

- `index.html` — interface, dialogs, and model-mode privacy disclosures
- `styles.css` — responsive, candlelit story layout and system-font design
- `app.js` — relay storage, local Ollama request, and Markdown export
- `worker.js` — fixed-sample hosted Gemma endpoint for the public judge preview
- `wrangler.jsonc` — Cloudflare Workers AI, rate limit, cache, and static asset setup
