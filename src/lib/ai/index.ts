import { streamAnalysis } from '@/lib/vertex';
import { MockProvider } from './types';
import type { AIProvider, AIRequest } from './types';

export * from './types';

export const VertexProvider = { streamAnalysis };

export function getProvider(): AIProvider {
  if (process.env.GCP_JSON_BASE64) {
    return {
      stream(req: AIRequest): AsyncIterable<string> {
        return streamAnalysis(
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
