const STORAGE_KEY = 'echoes-relay-v1';
const LEGACY_STORAGE_KEY = 'echoes-memories-v1';
const sampleRelay = {
  id: 'sample-walk-home',
  sample: true,
  prompt: 'What do you remember about the walk home after the summer rain?',
  responses: [
    { speaker: 'Rae', text: 'The pavement was still warm. We kept stepping around the puddles, except Mina, who went straight through the biggest one.' },
    { speaker: 'Mina', text: 'I remember Rae lending me a sleeve because I had soaked both my socks. The puddle was not that big.' }
  ]
};

let state = loadState();
let activeExchangeId = null;
const grid = document.querySelector('#relayList');
const toast = document.querySelector('#toast');
const relayDialog = document.querySelector('#relayDialog');
const voiceDialog = document.querySelector('#voiceDialog');

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `echo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.exchanges)) return parsed;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
    if (Array.isArray(legacy) && legacy.length) {
      return {
        exchanges: legacy.map(memory => {
          const sample = String(memory.id || '').startsWith('seed-');
          return {
            id: memory.id || makeId(), sample,
            prompt: `What do you remember about “${memory.title || 'this moment'}”?`,
            responses: [{ speaker: sample ? 'Fictional sample' : 'Earlier Echoes entry', text: [memory.title, memory.body].filter(Boolean).join('. ') }]
          };
        })
      };
    }
  } catch { /* Use the sample if browser storage is unavailable or malformed. */ }
  return { exchanges: [{ ...sampleRelay, responses: sampleRelay.responses.map(response => ({ ...response })) }] };
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { showToast('This browser could not save the relay. Export a keepsake to keep a copy.'); return false; }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}
function render() {
  const exchanges = state.exchanges;
  grid.innerHTML = exchanges.length ? exchanges.map(exchange => `
    <article class="relay-card">
      <p class="relay-question">“${escapeHTML(exchange.prompt)}”</p>
      ${exchange.sample ? '<span class="fiction-tag">FICTIONAL EXAMPLE</span>' : ''}
      <div class="responses">${exchange.responses.map(response => `
        <section class="response"><p class="response-speaker">${escapeHTML(response.speaker)}</p><p class="response-text">${escapeHTML(response.text)}</p></section>`).join('')}
      </div>
      <div class="relay-footer"><span class="relay-meta">${exchange.responses.length} ${exchange.responses.length === 1 ? 'VOICE' : 'VOICES'} · EACH VERSION KEPT AS TOLD</span><button class="add-voice" data-add-voice="${escapeHTML(exchange.id)}">＋ Add another voice</button></div>
    </article>`).join('') : '<p class="empty-state">No memories saved yet. Start with one moment, then leave room for someone else’s version.</p>';
  document.querySelector('#relayCount').textContent = `${String(exchanges.length).padStart(2, '0')} ${exchanges.length === 1 ? 'SHARED MOMENT' : 'SHARED MOMENTS'}`;
  const note = document.querySelector('#sampleNote');
  const hasSample = exchanges.some(exchange => exchange.sample);
  note.hidden = !hasSample && !exchanges.length;
  if (hasSample) note.innerHTML = '<span>FICTIONAL SAMPLE</span> Example only; remove it for a clean personal archive. <button type="button" class="remove-sample" id="removeSample">Remove example</button>';
  else if (exchanges.length) note.innerHTML = '<span>YOUR RELAY</span> Each person’s account stays in their own words.';
  else note.innerHTML = '<span>EMPTY ALTAR</span> Start a relay when you are ready.';
}

function openRelay(prefill = '') {
  document.querySelector('#relayForm').reset();
  document.querySelector('#promptInput').value = prefill;
  relayDialog.showModal();
  document.querySelector('#promptInput').focus();
}
function openVoice(exchangeId) {
  const exchange = state.exchanges.find(item => item.id === exchangeId);
  if (!exchange) return;
  activeExchangeId = exchangeId;
  document.querySelector('#activePrompt').textContent = `“${exchange.prompt}”`;
  document.querySelector('#voiceForm').reset();
  voiceDialog.showModal();
  document.querySelector('#voiceNameInput').focus();
}

document.querySelector('#startRelay').addEventListener('click', () => openRelay());
document.querySelector('#addRelayButton').addEventListener('click', () => openRelay());
document.querySelector('#relayForm').addEventListener('submit', event => {
  event.preventDefault();
  const prompt = document.querySelector('#promptInput').value.trim();
  const speaker = document.querySelector('#speakerInput').value.trim();
  const text = document.querySelector('#responseInput').value.trim();
  if (!prompt || !speaker || !text) return;
  state.exchanges.unshift({ id: makeId(), prompt, responses: [{ speaker, text }] });
  const saved = persist(); render(); relayDialog.close(); event.target.reset();
  showToast(saved ? 'Their voice is part of the relay now.' : 'Added for this session only. Export a keepsake to keep a copy.');
});
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add-voice]');
  if (button) openVoice(button.dataset.addVoice);
});
document.querySelector('#sampleNote').addEventListener('click', event => {
  if (event.target.id !== 'removeSample') return;
  state.exchanges = state.exchanges.filter(exchange => !exchange.sample);
  const saved = persist(); render(); showToast(saved ? 'Fictional example removed from this device.' : 'Example removed for this session. Browser storage could not be updated.');
});
document.querySelector('#voiceForm').addEventListener('submit', event => {
  event.preventDefault();
  const exchange = state.exchanges.find(item => item.id === activeExchangeId);
  const speaker = document.querySelector('#voiceNameInput').value.trim();
  const text = document.querySelector('#voiceResponseInput').value.trim();
  if (!exchange || !speaker || !text) return;
  exchange.responses.push({ speaker, text });
  const saved = persist(); render(); voiceDialog.close(); event.target.reset(); activeExchangeId = null;
  showToast(saved ? 'Another perspective, kept alongside the first.' : 'Added for this session only. Export a keepsake to keep a copy.');
});

document.querySelectorAll('.close-button').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelector('#aboutButton').addEventListener('click', () => document.querySelector('#aboutDialog').showModal());
document.querySelector('#exportButton').addEventListener('click', exportKeepsake);
document.querySelector('#clearButton').addEventListener('click', () => document.querySelector('#confirmDialog').showModal());
document.querySelector('#confirmDialog').addEventListener('close', event => {
  if (event.target.returnValue !== 'clear') return;
  state = { exchanges: [] };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); localStorage.removeItem(LEGACY_STORAGE_KEY);
    render(); resetQuestionCard(); showToast('Memories removed from this browser.');
  } catch {
    render(); resetQuestionCard(); showToast('Cleared from this screen, but browser storage was blocked. Clear this site’s storage in browser settings.');
  }
});

function exportKeepsake() {
  if (!state.exchanges.length) { showToast('There are no memories to export yet.'); return; }
  const lines = ['# Echoes — Memory Relay', '', `Exported ${new Date().toLocaleString()}`, '', '> Each account below is preserved as entered. Echoes does not decide which version is true.', ''];
  for (const exchange of state.exchanges) {
    if (exchange.sample) lines.push('> Fictional sample; not a real family story.', '');
    lines.push(`## ${exchange.prompt}`, '');
    for (const response of exchange.responses) lines.push(`**${response.speaker}:**`, '', response.text, '');
  }
  lines.push('---', '', 'Suggested questions, if any, were generated locally and should be reviewed by a person before sharing.', '');
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `echoes-memory-relay-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  showToast('Keepsake downloaded as Markdown.');
}

function resetQuestionCard() {
  const output = document.querySelector('#storyOutput');
  output.classList.remove('generating');
  output.innerHTML = '<div class="output-flower">✳</div><p class="output-label">A QUESTION FOR THE NEXT VOICE</p><p class="output-placeholder">The model will suggest<br>one thing to ask.</p><span class="output-rule"></span><span class="output-credit">SUGGESTED LOCALLY · REVIEW BEFORE SHARING</span>';
}
const commonWords = new Set('about after again also another around because before being between could every from have into just more most other should some than that their them then there these they this those through under until very were what when where which while with would your'.split(' '));
function findSourceWord(question, stories) {
  const questionWords = (question.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || []).filter(word => word.length > 3 && !commonWords.has(word));
  const sourceWords = stories.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
  for (const sourceWord of sourceWords) {
    if (sourceWord.length < 4 || commonWords.has(sourceWord)) continue;
    if (questionWords.some(word => word === sourceWord || word.startsWith(sourceWord) || sourceWord.startsWith(word))) return sourceWord;
  }
  return null;
}
async function suggestQuestion() {
  if (!state.exchanges.some(exchange => exchange.responses.length && !exchange.sample)) {
    showToast('Add your own relay first. The fictional example is not sent to Gemma.'); return;
  }
  const output = document.querySelector('#storyOutput');
  const button = document.querySelector('#questionButton');
  const model = document.querySelector('#modelName').value.trim() || 'gemma3:4b';
  const stories = state.exchanges.filter(exchange => !exchange.sample).flatMap(exchange => exchange.responses.map(response => `Prompt: ${exchange.prompt}\n${response.speaker}: ${response.text}`)).join('\n\n');
  const prompt = `You help families continue a memory-sharing conversation. Read the accounts below and suggest exactly one short, gentle, open-ended question for another person to answer. Do not speak as anyone in the stories. Do not invent people, events, emotions, or details. Do not imply one account is more correct. Ask about a detail or perspective already present, without asserting new facts. Include at least one specific word copied from an account. Return only the question, with no preface or quotation marks.\n\nAccounts:\n${stories}`;
  output.classList.add('generating');
  output.innerHTML = '<div class="output-flower">✳</div><p class="output-label">ASKING GEMMA, HERE ON THIS DEVICE</p><p class="output-placeholder">One gentle question<br>is on its way…</p>';
  button.disabled = true; button.textContent = 'Listening…';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    let question = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      const retryPrompt = attempt === 0 ? prompt : `${prompt}\n\nYour last suggestion did not reuse a specific word from the accounts. Try again and copy at least one meaningful word exactly as written.`;
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ model, prompt: retryPrompt, stream: false, options: { temperature: 0.25 } })
      });
      if (!response.ok) throw new Error(response.status === 404 ? `Model “${model}” not found. Run: ollama pull ${model}` : `Ollama returned ${response.status}.`);
      const data = await response.json();
      question = String(data.response || '').trim().replace(/^['“"]|['”"]$/g, '').replace(/^Question:\s*/i, '');
      if (question && findSourceWord(question, stories)) break;
      question = '';
    }
    if (!question) throw new Error('The model could not produce a question using a specific word from the stories. Review the relay and try again.');
    const anchor = findSourceWord(question, stories);
    output.classList.remove('generating');
    output.innerHTML = `<div class="output-flower">✳</div><p class="output-label">GEMMA’S SUGGESTION · REVIEW BEFORE SHARING</p><p class="output-question">${escapeHTML(question)}</p><p class="grounding-note">Source word carried over: <strong>${escapeHTML(anchor)}</strong></p><div class="output-actions"><button id="useQuestion">Start a relay with this</button><button id="copyQuestion">Copy question</button></div><span class="output-rule"></span><span class="output-credit">GENERATED LOCALLY WITH ${escapeHTML(model.toUpperCase())}</span>`;
    document.querySelector('#useQuestion').addEventListener('click', () => openRelay(question));
    document.querySelector('#copyQuestion').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(question); showToast('Question copied.'); }
      catch { showToast('Clipboard unavailable. Select and copy the question.'); }
    });
    document.querySelector('#modelHint').textContent = 'Question suggested on this device. Review before sharing.';
  } catch (error) {
    output.classList.remove('generating');
    let message = error.name === 'AbortError' ? 'Ollama took too long to answer. Try a smaller local model.' : error.message;
    if (error instanceof TypeError || error.message.includes('fetch')) message = 'Could not reach local Ollama. Start Ollama and serve this page from localhost; see the README.';
    const label = message.includes('specific word') ? 'THE QUESTION NEEDS A SOURCE DETAIL' : 'THE LOCAL MODEL IS NOT READY';
    output.innerHTML = `<div class="output-flower">✳</div><p class="output-label">${label}</p><p class="output-error">${escapeHTML(message)}</p><span class="output-rule"></span><span class="output-credit">STORIES ARE STILL SAVED ON THIS DEVICE</span>`;
  } finally {
    clearTimeout(timeout); button.disabled = false; button.innerHTML = 'Suggest a question <span aria-hidden="true">↗</span>';
  }
}
document.querySelector('#questionButton').addEventListener('click', suggestQuestion);
document.querySelector('#demoButton').addEventListener('click', previewHostedDemo);

async function previewHostedDemo() {
  const output = document.querySelector('#storyOutput');
  const button = document.querySelector('#demoButton');
  output.classList.add('generating');
  output.innerHTML = '<div class="output-flower">✳</div><p class="output-label">ASKING HOSTED GEMMA ABOUT THE FICTIONAL SAMPLE</p><p class="output-placeholder">Your saved relay<br>is not part of this request.</p>';
  button.disabled = true; button.textContent = 'Loading sample…';
  try {
    // Deliberately send no request body. The server owns the fixed fictional sample.
    const response = await fetch('/api/demo-question', { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Hosted demo returned ${response.status}.`);
    const question = String(data.question || '').trim();
    if (!question) throw new Error('The hosted model returned an empty question. Try again later.');
    output.classList.remove('generating');
    output.innerHTML = `<div class="output-flower">✳</div><p class="output-label">HOSTED GEMMA · FICTIONAL SAMPLE · REVIEW BEFORE SHARING</p><p class="output-question">${escapeHTML(question)}</p><p class="grounding-note">Source word carried over: <strong>${escapeHTML(data.sourceWord || 'sample story')}</strong></p><div class="output-actions"><button id="useQuestion">Start a relay with this</button><button id="copyQuestion">Copy question</button></div><span class="output-rule"></span><span class="output-credit">${escapeHTML(data.model || 'GEMMA 4')} · HOSTED BY VERCEL AI GATEWAY</span>`;
    document.querySelector('#useQuestion').addEventListener('click', () => openRelay(question));
    document.querySelector('#copyQuestion').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(question); showToast('Question copied.'); }
      catch { showToast('Clipboard unavailable. Select and copy the question.'); }
    });
  } catch (error) {
    output.classList.remove('generating');
    const message = error instanceof TypeError || error.message.includes('fetch')
      ? 'The hosted demo is not deployed yet. Your saved relay was not sent. The local Ollama option still works on this device.'
      : error.message.includes('404')
        ? 'This site has no hosted demo endpoint configured yet. Your saved relay was not sent. The local Ollama option still works on this device.'
      : error.message;
    output.innerHTML = `<div class="output-flower">✳</div><p class="output-label">HOSTED SAMPLE NOT AVAILABLE</p><p class="output-error">${escapeHTML(message)}</p><span class="output-rule"></span><span class="output-credit">NO PERSONAL RELAY DATA WAS SENT TO THIS ENDPOINT</span>`;
  } finally { button.disabled = false; button.textContent = 'Try the cloud sample'; }
}

render();
