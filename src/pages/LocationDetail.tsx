import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNodeView, ScriptedConnector, Schedule } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BufferStatus } from "@/components/BufferStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {
  FileText, Clock, ChevronDown, ChevronRight, Cpu, ShieldBan, Key
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function LocationDetail() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const nodeView = getNodeView(locationId || '');
  const [expandedConnector, setExpandedConnector] = useState<string | null>(null);

  if (!nodeView) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Node not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  const node = nodeView.node;

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Overview</button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{nodeView.displayName}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Location + Node info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">{nodeView.displayName}</h1>
            </div>
            {!nodeView.description && ( /*there's no node description - only a name*/
              <p className="text-sm text-muted-foreground mt-1 ml-8">{nodeView.description}</p>
            )}
          </div>

          {/* Node health section */}
          {node && (
            <Card className="shadow-sm">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{node.name}</CardTitle>
                    <StatusIndicator status={node.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{node.ipAddress}</span>
                    <span>v{node.version}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <InfoCard label="Last Packet" value={formatDistanceToNow(new Date(node.lastPacketReceived)) + ' ago'} />
                </div>
                {node.packetStats.isRecovering && <BufferStatus stats={node.packetStats} />}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:w-56">
          {node && (
            <>
              <CollectLogsDialog triggerLabel="Collect Node Logs" targetName={node.name} />
              <KeyRotationDialog
                nodeName={node.name}
                onSave={() => toast({ title: "Key configured", description: `Second Organisation Key has been configured on ${node.name}.` })}
              />
              <BanNodeDialog
                nodeName={node.name}
                onBan={() => toast({ title: "Node banned", description: `${node.name} has been banned and will be disconnected.`, variant: "destructive" })}
              />
            </>
          )}
        </div>
      </div>
      {/* Connectors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scripted Connectors</h2>
          <span className="text-xs text-muted-foreground">{nodeView.connectors.length} deployed</span>
        </div>
        <div className="space-y-3">
          {nodeView.connectors.map(connector => (
            <ConnectorSection
              key={connector.id}
              connector={connector}
              expanded={expandedConnector === connector.id}
              onToggle={() => setExpandedConnector(expandedConnector === connector.id ? null : connector.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-md px-3 py-2">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function ConnectorSection({
  connector, expanded, onToggle
}: {
  connector: ScriptedConnector;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusColors: Record<string, string> = {
    running: 'text-success',
    error: 'text-destructive',
    stopped: 'text-muted-foreground',
  };
  const dotColors: Record<string, string> = {
    running: 'bg-success',
    error: 'bg-destructive',
    stopped: 'bg-muted-foreground',
  };

  return (
    <Card className={`shadow-sm transition-all ${expanded ? 'border-primary/30 shadow-md' : ''}`}>
      <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <div className={`w-2 h-2 rounded-full ${dotColors[connector.status]}`} />
            <CardTitle className="text-sm">{connector.name}</CardTitle>
            <Badge variant="secondary" className="text-[10px] font-mono">v{connector.version}</Badge>
            <span className={`text-xs font-medium capitalize ${statusColors[connector.status]}`}>{connector.status}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">{connector.bandwidthKbps > 0 ? `${(connector.bandwidthKbps / 1000).toFixed(1)} Mbps` : '—'}</span>
            <span>{connector.schedules.length} schedule(s)</span>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {connector.lastError && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-md font-mono">
              ⚠ {connector.lastError}
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Schedules</h4>
            <div className="space-y-3">
              {connector.schedules.map(schedule => (
                <ScheduleRow
                  key={schedule.id}
                  schedule={schedule}
                  connectorArguments={connector.arguments}
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <CollectLogsDialog triggerLabel="Collect Logs" targetName={connector.name} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function CollectLogsDialog({
  triggerLabel,
  targetName,
}: {
  triggerLabel: string;
  targetName: string;
}) {
  const { toast } = useToast();

  const handleDownload = () => {
    const safeTarget = targetName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${safeTarget}-logs-${timestamp}.txt`;
    const fileContent = [
      `Log collection export`,
      `Target: ${targetName}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Logs would be retrieved over the active Edge connection and downloaded to your device.`,
    ].join("\n");

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Log download started",
      description: `${fileName} is being downloaded over the connection.`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-3 h-3 mr-2" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Logs</DialogTitle>
          <DialogDescription>
            Logs for <strong>{targetName}</strong> will be downloaded over the current Edge connection.
            Continue to start the download?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleDownload}>Download Logs</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleRow({
  schedule,
  connectorArguments,
}: {
  schedule: Schedule;
  connectorArguments: Record<string, string>;
}) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{schedule.name}</span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            <Clock className="w-2.5 h-2.5 mr-1" />
            {schedule.cron}
          </Badge>
        </div>
      </div>
      {schedule.lastRun && (
        <div className="text-[11px] text-muted-foreground flex gap-4">
          <span>Last: {formatDistanceToNow(new Date(schedule.lastRun))} ago</span>
          {schedule.nextRun && <span>Next: {formatDistanceToNow(new Date(schedule.nextRun))}</span>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {Object.entries(connectorArguments).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <Label className="text-xs w-24 text-muted-foreground shrink-0">{key}</Label>
            <Input className="h-7 text-[11px] font-mono" value={val} readOnly aria-readonly />
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyRotationDialog({ nodeName, onSave }: { nodeName: string; onSave: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="w-3 h-3 mr-2" /> Configure Keys
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organisation Key Configuration</DialogTitle>
          <DialogDescription>
            Configure a second Organisation Key on <strong>{nodeName}</strong> for seamless key rotation.
            Once the node starts using the new key, the old key can be released
            via <a href="https://admin.dataminer.services" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">admin.dataminer.services</a>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Current Key</Label>
            <Input className="h-8 text-xs font-mono" value="••••••••••••••••a1b2" disabled />
            <p className="text-[11px] text-muted-foreground">Active since Jan 15, 2026</p>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs">Second Key (optional)</Label>
            <Input className="h-8 text-xs font-mono" placeholder="Paste new Organisation Key" />
            <p className="text-[11px] text-muted-foreground">
              The node will begin using this key once configured. You can then revoke the original key
              from <a href="https://admin.dataminer.services" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">admin.dataminer.services</a>.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSave}>
              <Key className="w-3 h-3 mr-1" /> Save Key
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function BanNodeDialog({ nodeName, onBan }: { nodeName: string; onBan: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/5">
          <ShieldBan className="w-3 h-3 mr-2" /> Ban Node
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Edge Node</DialogTitle>
          <DialogDescription>
            Banning <strong>{nodeName}</strong> will immediately disconnect the node, revoke all keys,
            and prevent it from re-registering. This action is intended for compromised nodes.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-medium text-destructive mb-1">⚠ This action cannot be easily undone</p>
          <p>
            All running connectors on this node will be stopped. The node will need to be
            reinstalled and re-approved to reconnect to the DataMiner System.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onBan}>
              <ShieldBan className="w-3 h-3 mr-1" /> Ban Node
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
