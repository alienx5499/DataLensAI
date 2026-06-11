import gcpCredentials from './gcp.json';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

const project = process.env.GCP_PROJECT_ID || 'algolab-492207';
const location = process.env.GCP_LOCATION || 'us-central1';

// Try each model in order; first success wins.
// Model names change frequently across GCP projects/regions.
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

async function getAccessToken(): Promise<string> {
  const creds = gcpCredentials as { client_email: string; private_key: string };
  const jwt = (await import('jsonwebtoken')).default;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const signed = jwt.sign(payload, creds.private_key, { algorithm: 'RS256' });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signed,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get token');
  return data.access_token;
}

function buildUrl(model: string) {
  return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
}

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

  const systemPrompt = `You are DataLensAI, a rigorous data analyst.
Respond with valid JSON only (no markdown).

Dataset profile:
${JSON.stringify(profile, null, 2)}

Data sample (first 5 rows):
${JSON.stringify(dataSample, null, 2)}

${
  history.length
    ? `Previous Q&A:\n${history
        .map((h, i) => `${i + 1}. Q: ${h.question}\n A: ${h.findings}`)
        .join('\n')}`
    : ''
}

User question: "${question}"

Return EXACT JSON:
{
 "chartConfig": {"type": "bar"|"line"|"scatter"|"pie"|"heatmap"|"distribution"|null, "title": "string", "xAxis": "string|null", "yAxis": "string|null", "data": [{"name": "string", "value": number}]},
 "findings": "Plain English insight (2-3 sentences).",
 "limitations": "What this analysis cannot tell us.",
 "stats": {"totalRows": number, "matchingRows": number},
 "suggestions": ["Follow-up 1", "Follow-up 2"]
}`;

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

interface ColumnInfo {
  name: string;
  type: string;
}

function generateMock(
  question: string,
  profile: unknown,
  dataSample: unknown[]
) {
  const q = question.toLowerCase();
  const p = profile as { totalRows?: number; columns?: ColumnInfo[] };
  const cols = p?.columns || [];
  const sample = (dataSample as Record<string, unknown>[]) || [];
  const totalRows = p?.totalRows || sample.length || 12;

  /* eslint-disable no-useless-assignment */
  let chartType: string = 'bar';
  let title: string = 'Analysis Results';
  let data: Array<{ name: string; value: number }> = [];
  let findings: string = '';
  let limitations =
    'Based on sample data. Full dataset may show different patterns.';

  if (sample.length > 0 && cols.length > 0) {
    const firstCol = cols[0].name;
    const valueCol =
      cols.find((c) => c.type === 'number')?.name ||
      Object.keys(sample[0]).find((k) => typeof sample[0][k] === 'number') ||
      Object.keys(sample[0])[1];

    if (
      q.includes('top') ||
      q.includes('highest') ||
      q.includes('best') ||
      q.includes('most')
    ) {
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Unknown');
        const val = Number(row[valueCol]) || 0;
        agg[key] = (agg[key] || 0) + val;
      }
      data = Object.entries(agg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
      title = `Top ${firstCol} by ${valueCol}`;
      const top3Sum = data.slice(0, 3).reduce((s, d) => s + d.value, 0);
      const totalSum = data.reduce((s, d) => s + d.value, 0) || 1;
      findings = `Top 3 ${firstCol} contribute ${Math.round((top3Sum / totalSum) * 100)}% of total ${valueCol}. Leader: ${data[0]?.name || 'N/A'}.`;
    } else if (
      q.includes('trend') ||
      q.includes('over time') ||
      q.includes('growth') ||
      q.includes('month')
    ) {
      chartType = 'line';
      const values = sample
        .slice(0, 10)
        .map((row) => Number(row[valueCol]) || 0);
      data = values.map((v, i) => ({ name: `P${i + 1}`, value: v }));
      title = `${valueCol} Over Time`;
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      const trend =
        values.length > 1 && values[values.length - 1] > values[0]
          ? 'increasing'
          : 'decreasing';
      findings = `${valueCol} ${trend}. Range: ${Math.min(...values).toFixed(0)} to ${Math.max(...values).toFixed(0)}. Average: ${avg.toFixed(0)}.`;
    } else if (
      q.includes('distribut') ||
      q.includes('breakdown') ||
      q.includes('split')
    ) {
      chartType = 'pie';
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Other');
        agg[key] = (agg[key] || 0) + 1;
      }
      data = Object.entries(agg).map(([name, value]) => ({ name, value }));
      title = `${firstCol} Distribution`;
      findings = `${data.length} ${firstCol} categories. Largest: ${data.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}.`;
    } else {
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Unknown');
        const val = Number(row[valueCol]) || 1;
        agg[key] = (agg[key] || 0) + val;
      }
      data = Object.entries(agg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
      title = `${valueCol} by ${firstCol}`;
      const total = data.reduce((s, d) => s + d.value, 0);
      findings = `Total ${valueCol}: ${total.toFixed(0)} across ${data.length} ${firstCol} categories. Top: ${data[0]?.name || 'N/A'}.`;
    }
  } else {
    data = [
      { name: 'A', value: 4200 },
      { name: 'B', value: 3100 },
      { name: 'C', value: 2800 },
      { name: 'D', value: 1900 },
    ];
    title = 'Demo Data';
    findings = 'Demo mode. Upload data for real analysis.';
  }

  if (q.includes('correl') || q.includes('relationship')) {
    limitations =
      'Correlation does not imply causation. External factors may influence results.';
  }

  return {
    chartConfig: {
      type: chartType,
      title,
      xAxis: cols[0]?.name || 'Category',
      yAxis: cols.find((c) => c.type === 'number')?.name || 'Value',
      data,
    },
    findings,
    limitations,
    stats: { totalRows, matchingRows: totalRows },
    suggestions: [
      'Explore another dimension',
      'Check trends over time',
      'View raw data table',
    ],
  };
}
