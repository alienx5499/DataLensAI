const project = process.env.GCP_PROJECT_ID || 'algolab-492207';
const location = process.env.GCP_LOCATION || 'us-central1';

// Try flash first (cheaper, faster). Fall back to pro if unavailable.
export const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];

export function buildUrl(model: string): string {
  return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
}
