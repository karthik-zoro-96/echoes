const MODEL = 'google/gemma-4-26b-a4b-it';
const SAMPLE_ACCOUNTS = `Prompt: What do you remember about the walk home after the summer rain?\nRae: The pavement was still warm. We kept stepping around the puddles, except Mina, who went straight through the biggest one.\nMina: I remember Rae lending me a sleeve because I had soaked both my socks. The puddle was not that big.`;
const COMMON_WORDS = new Set('about after again also another around because before being between could every from have into just more most other should some than that their them then there these they this those through under until very were what when where which while with would your'.split(' '));

function sourceWordIn(question) {
  const questionWords = (question.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || []).filter(word => word.length > 3 && !COMMON_WORDS.has(word));
  const sourceWords = SAMPLE_ACCOUNTS.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
  return sourceWords.find(sourceWord => sourceWord.length > 3 && !COMMON_WORDS.has(sourceWord) && questionWords.some(word => word === sourceWord || word.startsWith(sourceWord) || sourceWord.startsWith(word))) || null;
}

function send(res, status, data, cacheControl = 'no-store') {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(status).json(data);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Use the sample demo endpoint without a request body.' });
  }
  if (req.url.includes('?')) return send(res, 400, { error: 'Query parameters are not accepted.' });

  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin && new URL(origin).host !== host) return send(res, 403, { error: 'This demo only accepts same-origin requests.' });
  if (!process.env.AI_GATEWAY_API_KEY) return send(res, 503, { error: 'Hosted Gemma is not configured yet. Your personal relay was not sent.' });

  try {
    let question = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      const retry = attempt === 0 ? '' : '\n\nYour first attempt did not reuse a specific word from the accounts. Try again and include one meaningful word exactly as written.';
      const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.25,
          max_tokens: 80,
          messages: [
            {
              role: 'system',
              content: 'You help families continue a memory-sharing conversation. Suggest exactly one short, gentle, open-ended question for another person. Do not speak as anyone in the stories. Do not invent people, events, emotions, or details. Do not decide which account is true. Ask about a detail or perspective already present. Include at least one specific word copied from the accounts. Return only the question.'
            },
            { role: 'user', content: `${SAMPLE_ACCOUNTS}${retry}` }
          ]
        })
      });
      if (!response.ok) throw new Error(`Gateway returned ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      question = (typeof content === 'string' ? content : '').trim().replace(/^['“"]|['”"]$/g, '').replace(/^Question:\s*/i, '');
      if (question && sourceWordIn(question)) break;
      question = '';
    }
    if (!question) return send(res, 502, { error: 'The sample model did not return a question grounded in the example.' });
    return send(res, 200, { question, sourceWord: sourceWordIn(question), model: 'Gemma 4 26B A4B' }, 'public, s-maxage=3600, stale-while-revalidate=86400');
  } catch {
    return send(res, 503, { error: 'Hosted Gemma is temporarily unavailable. Your personal relay was not sent.' });
  }
};
