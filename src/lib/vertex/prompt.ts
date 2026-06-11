export function buildSystemPrompt(
  question: string,
  profile: unknown,
  dataSample: unknown[],
  history: Array<{ question: string; findings: string }> = []
) {
  return `You are DataLensAI, a rigorous data analyst.
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
}
