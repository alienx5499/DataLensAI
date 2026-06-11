export interface ColumnInfo {
  name: string;
  type: string;
}

export type AIRequest = {
  question: string;
  profile: unknown;
  dataSample: unknown[];
  history: Array<{ question: string; findings: string }>;
};

export interface AIProvider {
  stream(req: AIRequest): AsyncIterable<string>;
}

export class MockProvider implements AIProvider {
  constructor(private readonly generate: (req: AIRequest) => string) {}

  async *stream(req: AIRequest): AsyncIterable<string> {
    yield this.generate(req);
  }
}
