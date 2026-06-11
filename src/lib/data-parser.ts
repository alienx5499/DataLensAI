import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { DataProfile, ColumnInfo, ColumnType } from '@/types';

export async function parseFile(
  file: File
): Promise<{ data: Record<string, unknown>[]; profile: DataProfile }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let data: Record<string, unknown>[] = []; // eslint-disable-line no-useless-assignment
  if (ext === 'csv') data = await parseCSV(file);
  else if (ext === 'json') data = await parseJSON(file);
  else if (ext === 'xlsx' || ext === 'xls') data = await parseExcel(file);
  else throw new Error(`Unsupported format: ${ext}`);
  const profile = createProfile(data, file.name, file.size);
  return { data, profile };
}

function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data as Record<string, unknown>[]),
      error: reject,
    });
  });
}

async function parseJSON(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

function createProfile(
  data: Record<string, unknown>[],
  fileName: string,
  fileSize: number
): DataProfile {
  const columns = data[0] ? Object.keys(data[0]) : [];
  const columnInfos: ColumnInfo[] = columns.map((name) => {
    const values = data.map((row) => row[name]);
    const nonNull = values.filter((v) => v != null && v !== '');
    const counts = new Map<string, number>();
    for (const v of nonNull) {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const topValues = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));
    const info: ColumnInfo = {
      name,
      type: detectType(nonNull),
      nullCount: values.length - nonNull.length,
      nullPercent: ((values.length - nonNull.length) / values.length) * 100,
      uniqueCount: new Set(nonNull.map(String)).size,
      sampleValues: [...new Set(nonNull.map(String))].slice(0, 5),
      topValues,
    };
    const nums = nonNull.filter((v): v is number => typeof v === 'number');
    if (nums.length) {
      info.min = Math.min(...nums);
      info.max = Math.max(...nums);
      info.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    return info;
  });
  return {
    id: crypto.randomUUID(),
    fileName,
    fileSize,
    rowCount: data.length,
    columns: columnInfos,
    uploadedAt: Date.now(),
  };
}

function detectType(values: unknown[]): ColumnType {
  const types = new Set<string>();
  for (const v of values.slice(0, 100)) {
    if (typeof v === 'number') types.add('number');
    else if (typeof v === 'boolean') types.add('boolean');
    else if (typeof v === 'string') {
      if (!isNaN(Number(v)) && v.trim() !== '') types.add('number');
      else if (!isNaN(Date.parse(v))) types.add('date');
      else types.add('string');
    }
  }
  if (values.length === 0) return 'string';
  if (types.size === 1) return [...types][0] as ColumnType;
  return 'mixed';
}

export function getDataSample(
  data: Record<string, unknown>[],
  limit = 5
): Record<string, unknown>[] {
  return data.slice(0, limit);
}
