import { Instagram, BrainCircuit, Webhook, MessagesSquare } from "lucide-react";
import { fetchDashboardStats } from "@/features/dashboard/services/dashboard-service";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { StatusPulse } from "@/components/ui/status-pulse";

export default async function DashboardPage() {
  const stats = await fetchDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Instagram"
          icon={<Instagram className="h-4 w-4" />}
          value={stats.instagramStatus === "connected" ? "Connected" : "Not connected"}
          footer={
            <StatusPulse
              status={stats.instagramStatus === "connected" ? "live" : "offline"}
              label={stats.instagramStatus === "connected" ? "Account linked" : "Awaiting setup"}
            />
          }
        />
        <StatCard
          label="AI Brain"
          icon={<BrainCircuit className="h-4 w-4" />}
          value={stats.aiStatus === "active" ? "Active" : "Inactive"}
          footer={
            <StatusPulse
              status={stats.aiStatus === "active" ? "live" : "offline"}
              label={stats.aiStatus === "active" ? "Replying to DMs" : "Not configured"}
            />
          }
        />
        <StatCard
          label="Webhook"
          icon={<Webhook className="h-4 w-4" />}
          value={stats.webhookStatus === "live" ? "Live" : "Offline"}
          footer={
            <StatusPulse
              status={stats.webhookStatus === "live" ? "live" : "offline"}
              label={stats.webhookStatus === "live" ? "Receiving events" : "Not connected"}
            />
          }
        />
        <StatCard
          label="Conversations"
          icon={<MessagesSquare className="h-4 w-4" />}
          value={stats.conversationCount.toLocaleString()}
          footer={<p className="text-[13px] text-muted">All time, across every customer</p>}
        />
      </div>

      <ActivityFeed items={stats.latestActivity} />
    </div>
  );
}
