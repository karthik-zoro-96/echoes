# Echoes: One Moment, Many Memories

> Draft for the [Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26). Add a genuine personal motivation or observed moment only if you want to share one; do not invent family testing or model metrics.

## What I built

Echoes is a local-first memory relay. One person writes down a shared moment in their own words; another person can add a different account beside it. Echoes keeps the voices separate instead of blending them into a single authoritative story.

An open-weight Gemma model has one small job: suggest a gentle follow-up question that might help another person add their perspective. Echoes does not imitate the person being remembered. It labels each question as a suggestion for a human to review.

## Try it

- **Live demo:** https://echoes-pearl-omega.vercel.app/
- **Source code:** https://github.com/karthik-zoro-96/echoes

The starter entry is explicitly fictional. The hosted demo sends only that fixed example to Gemma 4 through Vercel AI Gateway; it does not send anything from a visitor's saved relay. To try the private path, install Ollama, run `ollama pull gemma3:4b`, start Ollama, serve the app from `localhost`, and add your own relay. The app can export those accounts as Markdown.

## How it works

The interface is plain HTML, CSS, and JavaScript. Relay entries live in the current browser's local storage. In private mode, the browser sends the accounts to Ollama running on `localhost:11434`; the question is generated on that device. The hosted judge route accepts only a bodyless `GET` request, constructs the model prompt from a fixed fictional sample on the server, and keeps the Gateway key in a Vercel environment variable. It rejects cross-origin requests and caches successful responses at the edge. Caching helps reduce repeat inference, but is not a strict spending limit.

After Gemma suggests a question, Echoes checks whether it reused a meaningful word from the source stories and retries once if it did not. The interface shows that word to help a person inspect the suggestion. This lexical check is not proof that the whole question is grounded, so the person still reviews it.

## Why open innovation matters here

Family stories are personal. A locally run open-weight model lets a family generate a question without sending their archive to a hosted AI provider. The model and prompt can be inspected or changed, and the inference path stays on localhost. The plain-text Markdown export stays useful even if a specific model or runtime is replaced later.

The trade-off is setup: each person needs a local runtime and must download model weights. A small model may be slow or may suggest a question that assumes something not present in the accounts. Echoes keeps the model's role narrow and visible, and leaves the decision with the people sharing the memory.

The hosted sample makes the interaction available to judges without installing a model, while keeping real visitor stories out of that request. It's a convenience demo, not the privacy-preserving path.

## Prize category

- Best Use of Gemma

## Tags

`#devchallenge` `#hf26challenge` `#gemma`
