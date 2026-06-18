export type VertexError = 'retry-next' | 'fatal';

export function classifyVertexError(status: number, body: string): VertexError {
  if (body.includes('NOT_FOUND') || status === 404) return 'retry-next';
  if (body.includes('BILLING_DISABLED') || body.includes('PERMISSION_DENIED')) {
    return 'fatal';
  }
  return 'retry-next';
}
