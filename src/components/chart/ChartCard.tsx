'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

export function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <Card className="glass shadow-glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium tracking-tight">
          {title}
        </CardTitle>
        {caption && (
          <p className="text-xs text-muted-foreground mt-1 text-pretty">
            {caption}
          </p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
