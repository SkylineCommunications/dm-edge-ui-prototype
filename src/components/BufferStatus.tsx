import { DataPacketStats } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";

export function BufferStatus({ stats }: { stats: DataPacketStats }) {
  const bufferPercent = (stats.bufferSize / stats.bufferCapacity) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Buffer</span>
        <span className="font-mono">
          {stats.bufferSize.toLocaleString()} / {stats.bufferCapacity.toLocaleString()}
        </span>
      </div>
      <Progress value={bufferPercent} className="h-1.5" />
      <div className="flex gap-4 text-xs">
        <span className="text-success">
          ✓ {stats.accepted.toLocaleString()} accepted
        </span>
        <span className={stats.dropped > 0 ? "text-destructive" : "text-muted-foreground"}>
          ✗ {stats.dropped.toLocaleString()} dropped
          {stats.dropReason && ` (${stats.dropReason.replace('_', ' ')})`}
        </span>
      </div>
      {stats.isRecovering && (
        <div className="flex items-center gap-2 text-xs text-warning font-medium">
          <span className="status-dot-recovering" />
          Emptying buffer — connection restored
        </div>
      )}
    </div>
  );
}
