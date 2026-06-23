import { NextRequest } from 'next/server';
import { streamAnalysis } from '@/lib/vertex';
import '@/lib/env-validation';
import type { DataProfile } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { question, profile, dataSample, history } =
      (await request.json()) as {
        question: string;
        profile: DataProfile;
        dataSample: Record<string, unknown>[];
        history?: Array<{ question: string; findings: string }>;
      };

    if (!question?.trim() || !profile) {
      return new Response(
        JSON.stringify({ error: 'Missing question or profile' }),
        { status: 400 }
      );
    }

    let resultText = '';
    try {
      for await (const chunk of streamAnalysis(
        question,
        profile,
        dataSample,
        history
      )) {
        resultText += chunk;
      }

      resultText = resultText.trim();

      // Strip markdown code fences if AI added them
      if (resultText.startsWith('```')) {
        resultText = resultText
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/```\s*$/, '')
          .trim();
      }

      if (!resultText) {
        throw new Error('Empty response from AI');
      }

      // Validate JSON before sending
      JSON.parse(resultText);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('[AI Data Lens] Pipeline error:', errorMsg);
      return new Response(
        JSON.stringify({ error: `Analysis failed: unable to interpret dataset. Details: ${errorMsg}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(resultText, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Analysis error:', msg);
    return new Response(JSON.stringify({ error: `Analysis failed: ${msg}` }), { status: 500 });
  }
}
