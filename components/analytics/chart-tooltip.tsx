"use client";

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { name?: string; value?: number | string; color?: string }[];
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number | string) => string;
}

export function ChartTooltip({ active, label, payload, labelFormatter, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1 font-medium text-popover-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}:</span>
            <span className="font-medium text-popover-foreground">
              {valueFormatter && item.value !== undefined ? valueFormatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
