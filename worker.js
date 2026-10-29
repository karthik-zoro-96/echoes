const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const SAMPLE_ACCOUNTS = `Prompt: What do you remember about the walk home after the summer rain?\nRae: The pavement was still warm. We kept stepping around the puddles, except Mina, who went straight through the biggest one.\nMina: I remember Rae lending me a sleeve because I had soaked both my socks. The puddle was not that big.`;
const COMMON_WORDS = new Set('about after again also another around because before being between could every from have into just more most other should some than that their them then there these they this those through under until very were what when where which while with would your'.split(' '));

function sourceWordIn(question) {
  const questionWords = (question.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || []).filter(word => word.length > 3 && !COMMON_WORDS.has(word));
  const sourceWords = SAMPLE_ACCOUNTS.toLocaleLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
  return sourceWords.find(sourceWord => sourceWord.length > 3 && !COMMON_WORDS.has(sourceWord) && questionWords.some(word => word === sourceWord || word.startsWith(sourceWord) || sourceWord.startsWith(word))) || null;
}

function json(data, status = 200, cacheControl = 'no-store') {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': cacheControl, 'X-Content-Type-Options': 'nosniff' }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/demo-question') return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return json({ error: 'Use the sample demo endpoint without a request body.' }, 405);
    if (url.search) return json({ error: 'Query parameters are not accepted.' }, 400);

    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ error: 'This demo only accepts same-origin requests.' }, 403);

    try {
      const clientKey = request.headers.get('CF-Connecting-IP') || 'local-preview';
      const { success } = await env.DEMO_LIMITER.limit({ key: clientKey });
      if (!success) return json({ error: 'The sample demo is taking a short breather. Try again in a minute.' }, 429);

      let question = '';
      for (let attempt = 0; attempt < 2; attempt++) {
        const retry = attempt === 0 ? '' : '\n\nYour first attempt did not reuse a specific word from the accounts. Try again and include one meaningful word exactly as written.';
        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: 'system',
              content: 'You help families continue a memory-sharing conversation. Suggest exactly one short, gentle, open-ended question for another person. Do not speak as anyone in the stories. Do not invent people, events, emotions, or details. Do not decide which account is true. Ask about a detail or perspective already present. Include at least one specific word copied from the accounts. Return only the question.'
            },
            { role: 'user', content: `${SAMPLE_ACCOUNTS}${retry}` }
          ],
          temperature: 0.25,
          max_tokens: 80,
          chat_template_kwargs: { enable_thinking: false }
        }, { rejectIfBusy: true });

        question = String(result?.response || '').trim().replace(/^['“"]|['”"]$/g, '').replace(/^Question:\s*/i, '');
        if (question && sourceWordIn(question)) break;
        question = '';
      }
      if (!question) return json({ error: 'The sample model did not return a question grounded in the example.' }, 502);
      return json({ question, sourceWord: sourceWordIn(question), model: 'Gemma 4 26B A4B' }, 200, 'public, max-age=3600, s-maxage=3600');
    } catch {
      return json({ error: 'Hosted Gemma is temporarily unavailable. Your personal relay was not sent to this demo.' }, 503);
    }
  }
};
