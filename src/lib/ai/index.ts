import { streamAnalysis } from '@/lib/vertex';
import { MockProvider } from './types';
import type { AIProvider, AIRequest } from './types';

export * from './types';

export function getProvider(): AIProvider {
  if (process.env.GCP_JSON_BASE64) {
    return {
      async *stream(req: AIRequest): AsyncIterable<string> {
        yield* streamAnalysis(
          req.question,
          req.profile,
          req.dataSample,
          req.history
        );
      },
    };
  }
  return new MockProvider((req) => JSON.stringify({ question: req.question }));
}
