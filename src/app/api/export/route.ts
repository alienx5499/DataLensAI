import { NextRequest, NextResponse } from 'next/server';
import type { AnalysisSession } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { format, session } = (await request.json()) as {
    format: 'json' | 'csv';
    session: AnalysisSession;
  };

  if (format === 'json') {
    return new NextResponse(JSON.stringify(session, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="datalens-${session.fileName}.json"`,
      },
    });
  }

  const rows: string[] = ['question,findings,limitations,timestamp'];
  for (const e of session.entries) {
    const safe = (s: string) => `"${s.replace(/"/g, '""')}"`;
    rows.push(
      [
        safe(e.question),
        safe(e.findings),
        safe(e.limitations),
        String(e.timestamp),
      ].join(',')
    );
  }
  return new NextResponse(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="datalens-${session.fileName}.csv"`,
    },
  });
}
