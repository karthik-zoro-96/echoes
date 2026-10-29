# Echoes: Memory Relay

**One moment. Many memories.** Echoes gives people space to add their own account of a shared moment, keeping each voice separate. An open-weight model can suggest a gentle follow-up question; it does not imitate someone being remembered or decide which version is true.

## Try the judge demo

Deploy this repository to Vercel and add `AI_GATEWAY_API_KEY` as a server-side environment variable for the deployment. The key is used only by `api/demo-question.js`; never put it in browser code, commit it, or share it in a public issue. The app's **Try the cloud sample** button calls a bodyless `GET` endpoint. That server route ignores visitor data and sends only its hard-coded fictional example to Gemma 4 through Vercel AI Gateway. Successful results are cached at the Vercel edge for one hour. This public endpoint has no strict global request quota; configure a Gateway budget and review usage before sharing it widely.

To deploy, import `karthik-zoro-96/echoes` into Vercel with the repository root as the project root, add `AI_GATEWAY_API_KEY` under **Settings → Environment Variables** for Preview and Production, then deploy. The function returns a helpful setup message until the key is configured. Vercel can also add the environment variable with its CLI; enter the key in the CLI prompt, not in a command argument.

## Private local mode

1. Install [Ollama](https://ollama.com/download).
2. Pull Gemma: `ollama pull gemma3:4b`.
3. Start Ollama: `ollama serve` (if it is not already running).
4. In the project root, start a local web server: `python3 -m http.server 8000`.
5. Open `http://localhost:8000` in your browser.

The **Suggest a question** action sends the relays you created to `http://localhost:11434/api/generate`. It requires Ollama's local API to allow requests from the page's localhost origin. You can select another Ollama model compatible with `/api/generate`. This private path stays on the visitor's device. The fictional starter sample is excluded from this model request.

## How it works

- A relay stores a shared-moment prompt and one or more attributed responses.
- Browser `localStorage` keeps relay entries in the current browser profile; it is not a shared cloud archive.
- Local Gemma returns one suggested, open-ended question. The app requires a generated question to reuse a meaningful word from the source, retries once if it does not, and shows that word as a review aid. This lexical check does not prove the full question is factually grounded.
- The hosted judge demo receives only its fixed fictional sample. Its route accepts only bodyless `GET` requests, rejects query parameters and cross-origin requests, and never reads browser storage. Successful responses are cached at the edge; caching is not a strict spend limit.
- A Markdown keepsake can be downloaded for backup or sharing. The export preserves individual responses and marks the built-in fictional sample as fictional.
- **Clear memories from this device** removes saved relays from this browser.

The starter story uses invented characters and is labeled **Fictional example**. Remove it for a clean personal archive. Get each contributor's permission before recording or sharing their account.

## Why open AI

Family stories are personal. In private mode, an open-weight local model generates questions on a computer the family controls, without sending the archive to a hosted AI provider. The model and prompt can be inspected or changed, and that inference request stays on localhost. The optional judge preview demonstrates hosted Gemma using invented sample text only. The browser sends no relay text to that endpoint. The page uses system fonts and includes no analytics or hosted fonts.

## Honest limits

- A public website cannot reach each visitor's Ollama automatically; personal relays still require the local setup above.
- Local storage is tied to one browser profile and can be cleared by browser settings. Export the Markdown keepsake for a backup.
- The question can still assume something not present in the stories. Review every suggestion before sharing.
- The hosted sample endpoint uses edge caching but has no strict global rate or spend cap. Set a Vercel AI Gateway budget and monitor usage.
- No audio recording, transcription, user accounts, sync, or encrypted archive is included.
- A local model must be downloaded once and needs suitable device resources. After setup, inference can run without a hosted model API.

## Files

- `index.html` — interface, dialogs, and model-mode privacy disclosures
- `styles.css` — responsive layout and system-font design
- `app.js` — relay storage, local Ollama request, cloud sample request, and Markdown export
- `api/demo-question.js` — fixed-sample Vercel Function for the hosted Gemma preview
