import { DataPacketStats } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";

export function BufferStatus({
  stats,
  showPacketCounts = true,
}: {
  stats: DataPacketStats;
  showPacketCounts?: boolean;
}) {
  const bufferPercent = (stats.bufferSize / stats.bufferCapacity) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Buffer</span>
        <span className="font-mono text-foreground">
          {stats.bufferSize.toLocaleString()} / {stats.bufferCapacity.toLocaleString()}
        </span>
      </div>
      <Progress value={bufferPercent} className="h-1.5" />
      {showPacketCounts && (
        <div className="flex gap-4 text-xs">
          <span className="text-success font-medium">
            ✓ {stats.accepted.toLocaleString()} accepted
          </span>
          <span className={stats.dropped > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
            ✗ {stats.dropped.toLocaleString()} dropped
            {stats.dropReason && ` (${stats.dropReason.replace('_', ' ')})`}
          </span>
        </div>
      )}
      {stats.isRecovering && (
        <div className="flex items-center gap-2 text-xs text-warning font-medium bg-warning/10 px-2.5 py-1.5 rounded">
          <span className="status-dot-recovering" />
          Emptying buffer — connection restored
        </div>
      )}
    </div>
  );
}
