import { NextRequest, NextResponse } from 'next/server';
import { parseFile, getDataSample } from '@/lib/data-parser';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file)
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json', 'xlsx', 'xls'].includes(ext || '')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use CSV, JSON, or Excel.' },
        { status: 400 }
      );
    }

    const { data, profile } = await parseFile(file);
    const sample = getDataSample(data, 5);

    return NextResponse.json({ profile, sample, rowCount: data.length });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
