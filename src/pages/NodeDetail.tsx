import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockNodes, ScriptedConnector, Schedule } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BufferStatus } from "@/components/BufferStatus";
import { BandwidthChart } from "@/components/BandwidthChart";
import { LogViewer } from "@/components/LogViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  ArrowLeft, FileText, Trash2, Plus, Play, Square, Settings, Clock, Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function NodeDetail() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const node = mockNodes.find(n => n.id === nodeId);
  const [showNodeLog, setShowNodeLog] = useState(false);
  const [connectorLogId, setConnectorLogId] = useState<string | null>(null);
  const [expandedConnector, setExpandedConnector] = useState<string | null>(null);

  if (!node) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Node not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  const handleRemoveConnector = (connectorId: string) => {
    toast({ title: "Connector removed", description: `${connectorId} has been removed (prototype).` });
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    toast({ title: "Schedule removed", description: `${scheduleId} has been removed (prototype).` });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Node Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{node.name}</h1>
              <StatusIndicator status={node.status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
              <span>📍 {node.location}</span>
              <span className="font-mono">{node.ipAddress}</span>
              <span>v{node.version}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard label="Last Packet" value={formatDistanceToNow(new Date(node.lastPacketReceived)) + ' ago'} />
            <InfoCard label="Bandwidth" value={node.bandwidthKbps > 0 ? `${(node.bandwidthKbps / 1000).toFixed(1)} Mbps` : 'N/A'} />
            <InfoCard label="Connectors" value={String(node.connectors.length)} />
            <InfoCard label="Accepted" value={node.packetStats.accepted.toLocaleString()} />
          </div>

          <BufferStatus stats={node.packetStats} />
        </div>

        {/* Node actions */}
        <div className="flex flex-col gap-2 lg:w-48">
          <Button variant="outline" size="sm" onClick={() => setShowNodeLog(true)}>
            <FileText className="w-3 h-3 mr-2" /> Collect Node Logs
          </Button>
          <DeployConnectorDialog />
        </div>
      </div>

      {showNodeLog && <LogViewer title={node.name} onClose={() => setShowNodeLog(false)} />}

      <Separator />

      {/* Bandwidth */}
      <BandwidthChart title={`Bandwidth — ${node.name} (24h)`} />

      <Separator />

      {/* Connectors */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Scripted Connectors</h2>
        <div className="space-y-4">
          {node.connectors.map(connector => (
            <ConnectorSection
              key={connector.id}
              connector={connector}
              expanded={expandedConnector === connector.id}
              onToggle={() => setExpandedConnector(expandedConnector === connector.id ? null : connector.id)}
              onRemove={() => handleRemoveConnector(connector.id)}
              onRemoveSchedule={handleRemoveSchedule}
              showLog={connectorLogId === connector.id}
              onToggleLog={() => setConnectorLogId(connectorLogId === connector.id ? null : connector.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-mono font-semibold mt-0.5">{value}</p>
      </CardContent>
    </Card>
  );
}

function ConnectorSection({
  connector, expanded, onToggle, onRemove, onRemoveSchedule, showLog, onToggleLog
}: {
  connector: ScriptedConnector;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onRemoveSchedule: (id: string) => void;
  showLog: boolean;
  onToggleLog: () => void;
}) {
  const statusColor = connector.status === 'running' ? 'text-success' : connector.status === 'error' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card className={expanded ? 'border-primary/20' : ''}>
      <CardHeader className="py-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${connector.status === 'running' ? 'bg-success' : connector.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
            <CardTitle className="text-sm">{connector.name}</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">v{connector.version}</Badge>
            <span className={`text-xs font-medium capitalize ${statusColor}`}>{connector.status}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{connector.bandwidthKbps > 0 ? `${(connector.bandwidthKbps / 1000).toFixed(1)} Mbps` : '—'}</span>
            <span>{connector.schedules.length} schedule(s)</span>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {connector.lastError && (
            <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md font-mono">
              ⚠ {connector.lastError}
            </div>
          )}

          {/* Packet stats */}
          <BufferStatus stats={connector.packetStats} />

          {/* Arguments */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Arguments</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(connector.arguments).map(([key, val]) => (
                <div key={key} className="flex gap-2 items-center">
                  <Label className="text-xs w-24 text-muted-foreground shrink-0">{key}</Label>
                  <Input className="h-7 text-xs font-mono" defaultValue={val} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Schedules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedules</h4>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Schedule
              </Button>
            </div>
            <div className="space-y-3">
              {connector.schedules.map(schedule => (
                <ScheduleRow key={schedule.id} schedule={schedule} onRemove={() => onRemoveSchedule(schedule.id)} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onToggleLog}>
              <FileText className="w-3 h-3 mr-1" /> {showLog ? 'Hide Logs' : 'Collect Logs'}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-3 h-3 mr-1" /> Save Changes
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
              <Trash2 className="w-3 h-3 mr-1" /> Remove Connector
            </Button>
          </div>

          {showLog && <LogViewer title={connector.name} onClose={onToggleLog} />}
        </CardContent>
      )}
    </Card>
  );
}

function ScheduleRow({ schedule, onRemove }: { schedule: Schedule; onRemove: () => void }) {
  return (
    <div className="bg-muted/30 rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch defaultChecked={schedule.enabled} />
          <span className="text-sm font-medium">{schedule.name}</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            <Clock className="w-2.5 h-2.5 mr-1" />
            {schedule.cron}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {schedule.lastRun && (
        <div className="text-[11px] text-muted-foreground flex gap-4">
          <span>Last: {formatDistanceToNow(new Date(schedule.lastRun))} ago</span>
          {schedule.nextRun && <span>Next: {formatDistanceToNow(new Date(schedule.nextRun))}</span>}
        </div>
      )}
      {/* Schedule-specific arguments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {Object.entries(schedule.arguments).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <Label className="text-xs w-24 text-muted-foreground shrink-0">{key}</Label>
            <Input className="h-6 text-[11px] font-mono" defaultValue={val} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DeployConnectorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-3 h-3 mr-2" /> Deploy Connector
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Scripted Connector</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Connector</Label>
            <Input placeholder="e.g. SNMP Poller" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Version</Label>
            <Input placeholder="e.g. 2.1.0" />
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">Arguments (add key-value pairs)</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input className="h-8 text-xs" placeholder="Key (e.g. targetIp)" />
              <Input className="h-8 text-xs" placeholder="Value (e.g. 10.0.0.1)" />
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Argument
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Deploy</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
