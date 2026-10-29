# Echoes: Memory Relay — Let a memory keep its different voices

> Submission for the [Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).

Ask two people about the same walk home and you may hear two different stories. One remembers the warm pavement. The other remembers soaked socks. It is tempting to blend the accounts into one clean version. But a shared memory does not always have one owner, and disagreement can be part of what makes it worth keeping.

That is the idea behind **Echoes**: pass a memory hand to hand, leave every voice in its own words, and help someone find a kind question to ask next.

![Echoes local interface showing a small collection of everyday memories](https://raw.githubusercontent.com/karthik-zoro-96/echoes/main/screenshots/echoes-submission.png)

*Screenshot of the local memory-board interface. The hosted judge demo below currently shows the separate fixed fictional relay sample.*

## Try Echoes

- **Live demo:** https://echoes-pearl-omega.vercel.app/
- **Source code:** https://github.com/karthik-zoro-96/echoes

The sample story in the app is fictional. The **Try the cloud sample** button sends only that fixed example to Gemma 4 through Vercel AI Gateway; it never sends the visitor's saved relay. In one live request, Gemma suggested: *“How did it feel to step through that puddle?”* The app shows the source word it carried over so a person can inspect the suggestion.

## What the model does

Echoes gives Gemma a deliberately narrow role. It reads accounts of a shared moment and suggests one gentle, open question for another person. It does not speak as someone who has died, invent a memory, or decide which version is true. A person reviews the suggestion before using it.

The private path runs Gemma locally through Ollama. Start with `ollama pull gemma3:4b`, run `ollama serve`, then open the site from a local web server and add a relay of your own. The model field is editable, so people can try another compatible Ollama model. Local inference sends the accounts to Ollama on the same device; it does not send them to a hosted AI provider.

The hosted judge preview exists so someone can try the interaction without installing a model. Its serverless route accepts only a bodyless `GET`, constructs the prompt from a fixed fictional story, and keeps the Gateway key in a Vercel environment variable. It rejects cross-origin requests and caches successful results at the edge. The cache can reduce repeated calls, but it is not a strict spending limit.

After generation, Echoes checks whether the question reuses a meaningful word from the source and retries once if it does not. This is a small lexical check, not proof that the full question is grounded. The model can still make an assumption, so the person stays responsible for the question.

## Why open models matter for memory

Family stories are personal. Running an open-weight model locally means a family can ask for a follow-up without sending its archive to a hosted AI service. The prompt and model can be inspected or changed, and the inference path stays on the computer holding the stories. The app also exports the relay as plain Markdown, so the archive remains readable if a particular model or runtime disappears.

Local-first has a cost: each person must install Ollama, download model weights, and use a device with enough resources. A small model may be slow or may produce a weak question. Echoes makes that trade-off visible and keeps the model's role small. The tool should help people continue a conversation, not tell them what their memories mean.

## Built with

Plain HTML, CSS, and JavaScript; browser `localStorage`; Ollama; Gemma 3 4B for local inference; Gemma 4 26B A4B through Vercel AI Gateway for the fixed fictional preview; and a Vercel serverless function. There are no analytics or hosted font requests.

## Prize category

Best Use of Gemma

`#devchallenge` `#hf26challenge` `#gemma`
