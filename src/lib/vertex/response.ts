export interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

export function extractText(data: GeminiResponse): string | undefined {
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}
