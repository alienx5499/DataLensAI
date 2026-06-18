import { getAccessToken } from './auth';
import { buildUrl, MODELS } from './models';
import { generateMock } from './mock';
import { buildSystemPrompt } from './prompt';
import { extractText, GeminiResponse } from './response';
import { classifyVertexError } from './errors';

export async function* streamAnalysis(
  question: string,
  profile: unknown,
  dataSample: unknown[],
  history: Array<{ question: string; findings: string }> = []
) {
  let token: string;
  try {
    token = await getAccessToken();
  } catch {
    console.warn('[vertex] token failed, using mock');
    yield JSON.stringify(generateMock(question, profile, dataSample));
    return;
  }

  const prompt = buildSystemPrompt(question, profile, dataSample, history);
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  for (const model of MODELS) {
    console.log('[vertex] trying:', model);
    try {
      const res = await fetch(buildUrl(model), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!res.ok) {
        const errText = await res.text();
        if (classifyVertexError(res.status, errText) === 'fatal') {
          console.warn('[vertex] billing/permission issue, stopping');
          break;
        }
        continue;
      }
      const text = extractText((await res.json()) as GeminiResponse);
      if (text) {
        console.log('[vertex] success:', model);
        yield text;
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : e;
      console.warn('[vertex]', model, 'fetch failed:', msg);
      continue;
    }
  }

  console.warn('[vertex] all models failed, using mock');
  yield JSON.stringify(generateMock(question, profile, dataSample));
}
