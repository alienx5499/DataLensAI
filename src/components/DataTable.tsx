'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DataTable({
  data,
  pageSize = 10,
}: {
  data: Record<string, unknown>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);

  const columns = useMemo(
    () => (data[0] ? Object.keys(data[0]) : []),
    [data]
  );

  const rows = data.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  // Dataset profiling metrics
  const totalColumns = columns.length;

  const missingValues = data.reduce(
    (count, row) =>
      count +
      columns.filter(
        (col) =>
          row[col] === null ||
          row[col] === undefined ||
          row[col] === ''
      ).length,
    0
  );

  const numericColumns = columns.filter((col) =>
    data.some((row) => typeof row[col] === 'number')
  ).length;

  const categoricalColumns = totalColumns - numericColumns;

  return (
    <Card className="glass shadow-glass">
      <CardContent className="p-0">
        {/* Dataset Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground">Rows</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{data.length}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Columns</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{totalColumns}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Missing Values</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{missingValues}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Numeric Columns</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{numericColumns}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Categorical</p>
            <p className="text-2xl font-bold tracking-tight text-primary">{categoricalColumns}</p>
          </div>
        </div>

        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/80 backdrop-blur z-10">
              <TableRow>
                {columns.map((c) => (
                  <TableHead
                    key={c}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                  {columns.map((c) => (
                    <TableCell key={c} className="text-xs font-mono">
                      {String(row[c] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {page * pageSize + 1}-
            {Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </p>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) =>
                Math.min(totalPages - 1, p + 1)
              )}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}