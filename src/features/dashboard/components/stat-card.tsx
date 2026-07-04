import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  footer,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
            {icon}
          </span>
        </div>
        <div className="font-display text-2xl font-semibold text-ink">{value}</div>
        {footer && <div>{footer}</div>}
      </CardContent>
    </Card>
  );
}
