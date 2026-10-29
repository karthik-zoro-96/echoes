# Echoes: One Moment, Many Memories

> **Before publishing:** replace every bracketed note with a real detail from your build, add the repository and demo links, and include only results you personally observed. Do not publish this note or the fictional sample as a real family story.

This is my submission for the [Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).

## What I built

Echoes is a local-first memory relay. One person writes down a shared moment in their own words; another person can add a different account beside it. Echoes keeps the voices separate instead of blending them into a single authoritative story.

The local model has one small job: suggest a gentle follow-up question that might help another person add their perspective. Echoes does not imitate the person being remembered, and the question is labeled as a suggestion for a human to review.

## Demo

[Add a short screen recording or screenshots here.]

The starter entry in the app is explicitly fictional. It is there to demonstrate the relay and is excluded from the model request. To try local question generation, install Ollama, run `ollama pull gemma3:4b`, start Ollama, serve the app from `localhost`, and add your own relay. The app can export the saved accounts as Markdown.

## Code

[Add the public repository URL here.]

## How I built it

The interface is plain HTML, CSS, and JavaScript. Relay entries live in the current browser's local storage. In private mode, a question request goes from the browser to Ollama at `localhost:11434`. For the public judge preview, a Cloudflare Worker sends one fixed fictional sample to hosted Gemma 4; the browser sends no relay text to that endpoint. The model and prompt can be changed, and the local inference request stays on localhost. I removed external font and analytics requests.

After a model suggests a question, Echoes checks whether it reused a meaningful word from the source stories and retries once if it did not. The interface shows that word to help a person inspect the suggestion. This is only a lexical check; it does not prove the whole question is grounded, so the person still reviews it.

**Observed run:** [Add the exact model, device, cold/warm timing, and what you checked. Do not estimate or invent these results.]

## Why open innovation matters

Family memories deserve a tool whose model and data path people can inspect. A local open-weight model lets the question suggestion run on a device the family controls. The prompt and model can be changed, and the archive remains usable as plain Markdown even if a particular model or runtime is replaced later.

There is a trade-off: each person must install a local runtime and download model weights. A small model may be slow or may suggest a question that assumes something not in the stories. Echoes makes the model's role visible and keeps a person responsible for deciding whether the suggestion belongs in the conversation.

## The spirit of it

[Add your genuine reason for building this, and one specific moment from trying it with consent. If you have not tried it with another person, describe what you hope the relay makes possible instead.]

## Prize categories

- Best Use of Gemma — [Keep this only if your submitted project actually uses Gemma in the way the category requires.]

## Tags

`#devchallenge` `#hf26challenge` `#gemma`
