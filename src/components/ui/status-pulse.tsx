import { cn } from "@/lib/utils";

export type PulseStatus = "live" | "idle" | "offline";

const STATUS_STYLES: Record<PulseStatus, { dot: string; ring: string; text: string }> = {
  live: { dot: "bg-success", ring: "bg-success", text: "text-success" },
  idle: { dot: "bg-warning", ring: "bg-warning", text: "text-warning" },
  offline: { dot: "bg-muted", ring: "bg-muted", text: "text-muted" },
};

/**
 * The app's signature status indicator: a small dot with a soft
 * animated ring when live. Reused wherever a connection's health
 * needs to be shown at a glance (dashboard KPIs, sidebar, settings).
 */
export function StatusPulse({
  status,
  label,
  className,
}: {
  status: PulseStatus;
  label: string;
  className?: string;
}) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring",
              styles.ring
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", styles.dot)} />
      </span>
      <span className={cn("text-[13px] font-medium", styles.text)}>{label}</span>
    </span>
  );
}
