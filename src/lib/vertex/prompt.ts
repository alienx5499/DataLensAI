export function buildSystemPrompt(
  question: string,
  profile: unknown,
  dataSample: unknown[],
  history: Array<{ question: string; findings: string }> = []
) {
  const p = profile as {
    rowCount?: number;
    columns?: Array<{ name: string; type: string }>;
  };
  const schema =
    p?.columns?.map((c) => `${c.name} (${c.type})`).join(', ') || 'unknown';
  const sample = dataSample.slice(0, 3);

  return `You are AI Data Lens, a rigorous data analyst. Always respond with valid JSON only (no markdown, no prose outside the JSON).

Schema (${p?.rowCount || '?'} rows): ${schema}

Sample rows:
${JSON.stringify(sample)}

${
  history.length
    ? `Prior Q&A:\n${history
        .map(
          (h, i) =>
            `${i + 1}. Q: ${h.question.slice(0, 100)}\n A: ${h.findings.slice(0, 300)}`
        )
        .join('\n')}`
    : ''
}

Question: ${question}

Return EXACT JSON shape:
{"chartConfig":{"type":"bar|line|scatter|pie|null","title":"string","xAxis":"string","yAxis":"string","data":[{"name":"string","value":number}]},"findings":"2-3 sentence insight","limitations":"what this cannot tell us","stats":{"totalRows":number,"matchingRows":number},"suggestions":["follow-up 1","follow-up 2"]}`;
}
