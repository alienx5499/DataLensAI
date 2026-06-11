import { AIProvider, AIRequest } from '../ai/types';
import { getAccessToken } from './auth';
import { buildUrl, MODELS } from './models';
import { generateMock } from './mock';
import { buildSystemPrompt } from './prompt';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

// Re-export for convenience
export { getAccessToken } from './auth';
export { buildUrl, MODELS } from './models';
export { generateMock } from './mock';
export type { ColumnInfo } from './mock';
export { buildSystemPrompt } from './prompt';

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

  const systemPrompt = buildSystemPrompt(
    question,
    profile,
    dataSample,
    history
  );

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  for (const model of MODELS) {
    const url = buildUrl(model);
    console.log('[vertex] trying:', model);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!res.ok) {
        const errText = await res.text();
        if (errText.includes('NOT_FOUND') || res.status === 404) {
          continue; // try next model
        }
        if (
          errText.includes('BILLING_DISABLED') ||
          errText.includes('PERMISSION_DENIED')
        ) {
          console.warn('[vertex] billing/permission issue, stopping');
          break;
        }
        console.warn('[vertex]', model, 'err:', res.status);
        continue;
      }

      const data: GeminiResponse = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log('[vertex] success:', model);
        yield text;
        return;
      }
    } catch (e) {
      console.warn(
        '[vertex]',
        model,
        'fetch failed:',
        e instanceof Error ? e.message : e
      );
      continue;
    }
  }

  // All models failed, use mock
  console.warn('[vertex] all models failed, using mock');
  yield JSON.stringify(generateMock(question, profile, dataSample));
}

// VertexProvider class implementing AIProvider interface
export class VertexProvider implements AIProvider {
  async *stream(req: AIRequest): AsyncIterable<string> {
    yield* streamAnalysis(
      req.question,
      req.profile,
      req.dataSample,
      req.history
    );
  }
}
