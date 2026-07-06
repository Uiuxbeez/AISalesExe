import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ActivityItem } from "@/features/dashboard/types";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest activity</CardTitle>
        <CardDescription>What&apos;s happened across your account recently.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-muted">
            Nothing yet — activity will show up here once messages start coming in.
          </p>
        ) : (
          <ul className="flex flex-col">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 border-line py-3 first:pt-0 last:pb-0"
                style={{ borderTopWidth: index === 0 ? 0 : 1 }}
              >
                <span className="text-sm text-ink">{item.message}</span>
                <span className="shrink-0 text-xs text-muted">{item.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
