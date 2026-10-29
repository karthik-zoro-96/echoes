*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

## What I Built

Echoes is a local-first memory relay. It gives people a place to record different accounts of a shared moment without merging them into one supposedly definitive version. An open-weight model can suggest a gentle question to invite another voice into the conversation; the people sharing the memory remain its authors.

I interpreted “Ghost in the Machine” as a way to honor the stories people carry, without pretending software can speak for someone who is gone. Echoes does not impersonate a loved one or decide which memory is true.

![Echoes local interface showing a small collection of everyday memories](https://raw.githubusercontent.com/karthik-zoro-96/echoes/main/screenshots/echoes-submission.png)

*Screenshot of the local interface. The live hosted demo below is a separate, fixed fictional relay sample.*

## Demo

[Try Echoes live](https://echoes-pearl-omega.vercel.app/)

The **Try the cloud sample** button works without installing anything. It sends only the built-in fictional relay to hosted Gemma; it never sends a visitor’s saved relay. To use the local path with your own words, follow the Ollama steps in the project README.

## How to Use Echoes

1. Open the live demo and read the fictional starter relay to see how two accounts can preserve different details about the same moment.
2. Select **Start a memory relay**. Enter the moment, your name or initials, and your account. The relay is saved in this browser.
3. Select **Add another voice** on the relay to add another person’s account on the same device. Echoes does not sync memories between devices.
4. For a no-install preview, select **Try the cloud sample**; it uses only the fictional example. To ask about your own relay, install Ollama, run `ollama pull gemma3:4b` and `ollama serve`, then run `python3 -m http.server 8000` from the project folder and open `http://localhost:8000`. Select **Suggest a question** to send your relay to Ollama on this device.
5. Select **Export keepsake** to download a Markdown backup, or **Clear memories from this device** to remove the saved relays from this browser.

## Code

[View the Echoes source on GitHub](https://github.com/karthik-zoro-96/echoes)

## How I Built It

Echoes uses plain HTML, CSS, and JavaScript. Relays are stored in the current browser’s `localStorage`, and a Markdown keepsake can be exported as a backup.

For private question generation, the browser sends the selected relay to Ollama running on the same device. The default model is Gemma 3 4B (`gemma3:4b`); the model name is editable. The optional judge preview uses Gemma 4 26B A4B through Vercel AI Gateway. Its serverless route accepts a bodyless `GET` request and builds the model prompt from a fixed fictional example. The Gateway key stays in a Vercel environment variable.

Echoes checks whether a generated question reuses a meaningful source word and retries once if it does not. That is only a lexical check, not proof that the whole question is grounded. The result is labeled as a suggestion for a person to review.

## Why Does Open Innovation Matter?

The local Gemma path lets people generate a follow-up question without sending their archive to a hosted AI service. They can inspect or change the prompt, switch compatible local models, and keep the stories on the device where they were written. The export remains plain Markdown, so the archive can outlast any one model or runtime.

A closed hosted model could generate a similar question, but it would not provide the same local, inspectable inference path. The trade-off is setup: each person needs Ollama, a model download, and a device with enough resources. The hosted preview is more convenient, but it only demonstrates the interaction with invented sample text.

## The Spirit of It

The example is intentionally ordinary: one person remembers warm pavement after summer rain; another remembers soaked socks and a disputed puddle. A live sample request produced the question, *“How did it feel to step through that puddle?”* It offers a next step without choosing whose version wins. The sample and the stories in the screenshot are part of the demo interface; no personal family archive is included in the hosted request.

## Prize Categories

- Best Use of Gemma

`#devchallenge` `#hf26challenge` `#gemma`
