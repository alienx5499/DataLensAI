import { NextRequest } from 'next/server';
import { streamAnalysis } from '@/lib/vertex';
import type { DataProfile } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
 try {
 const { question, profile, dataSample, history } = (await request.json()) as {
 question: string;
 profile: DataProfile;
 dataSample: Record<string, unknown>[];
 history?: Array<{ question: string; findings: string }>;
 };

 if (!question?.trim() || !profile) {
 return new Response(JSON.stringify({ error: 'Missing question or profile' }), { status: 400 });
 }

 let resultText = '';
 for await (const chunk of streamAnalysis(question, profile, dataSample, history)) {
 resultText += chunk;
 }

 resultText = resultText.trim();

 // Strip markdown code fences if AI added them
 if (resultText.startsWith('```')) {
 resultText = resultText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
 }

 if (!resultText) {
 return new Response(JSON.stringify({ error: 'Empty response from AI' }), { status: 500 });
 }

 // Validate JSON before sending
 try {
 JSON.parse(resultText);
 } catch {
 return new Response(
 JSON.stringify({
 chartConfig: null,
 findings: resultText.substring(0, 500) || 'No response from AI',
 limitations: 'The AI response could not be parsed as JSON.',
 stats: {},
 }),
 { headers: { 'Content-Type': 'application/json' } }
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
 return new Response(JSON.stringify({ error: msg }), { status: 500 });
 }
}
