import type { IntentHandler, IntentResult } from '../types';

const introPatterns = [
  /^(who are you|what are you|what is this|what's this|what can you do|help|hi|hello|hey|yo|sup)\b/,
  /^(introduce yourself|about you|about this)/,
];

export const introIntent: IntentHandler = {
  matches(q) {
    return introPatterns.some((re) => re.test(q));
  },
  handle() {
    const result: IntentResult = {
      chartType: 'bar',
      title: 'DataLensAI - at a glance',
      data: [
        { name: 'CSV / JSON / Excel parsing', value: 100 },
        { name: 'Natural-language Q&A', value: 95 },
        { name: 'Auto chart selection', value: 90 },
        { name: 'Limitations surfaced', value: 100 },
      ],
      findings:
        "I'm DataLensAI - your autonomous data analysis partner. Upload any data file and ask questions in plain English. I surface the right visualization, synthesize findings, and flag limitations honestly. No SQL, no Python - just answers.\n\n**Try asking me**:\n• Show me the top performers\n• Plot a trend over time\n• Break down by category",
    };
    return result;
  },
};
