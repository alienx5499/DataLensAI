import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export function FindingsRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm leading-relaxed text-pretty space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1.5" />;
        }
        if (trimmed.startsWith('•')) {
          const body = trimmed.slice(1).trim();
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary mt-1.5 shrink-0 text-xs">●</span>
              <span className="flex-1">{renderInline(body)}</span>
            </div>
          );
        }
        if (
          trimmed.startsWith('**') &&
          trimmed.endsWith('**') &&
          trimmed.length > 4
        ) {
          return (
            <p key={i} className="font-semibold text-foreground">
              {trimmed.slice(2, -2)}
            </p>
          );
        }
        return (
          <p key={i} className="text-pretty">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
