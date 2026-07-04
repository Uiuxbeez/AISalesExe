export type ConnectionStatus = "connected" | "disconnected";
export type ToggleStatus = "active" | "inactive";
export type LiveStatus = "live" | "offline";

export type ActivityItem = {
  id: string;
  message: string;
  timestamp: string;
};

export type DashboardStats = {
  instagramStatus: ConnectionStatus;
  aiStatus: ToggleStatus;
  webhookStatus: LiveStatus;
  conversationCount: number;
  latestActivity: ActivityItem[];
};
