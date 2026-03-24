import { NodeStatus } from "@/data/mockData";

const labels: Record<NodeStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  recovering: 'Recovering',
  pending: 'Pending',
};

export function StatusIndicator({ status }: { status: NodeStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`status-dot-${status}`} />
      <span className="text-xs font-medium">{labels[status]}</span>
    </div>
  );
}
