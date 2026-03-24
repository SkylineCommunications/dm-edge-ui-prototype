import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLocation, ScriptedConnector, Schedule } from "@/data/mockData";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {
  FileText, Trash2, Plus, Settings, Clock, ChevronDown, ChevronRight, MapPin, Server, ExternalLink, Blocks, ShieldBan, ShieldOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CATALOG_URL = "https://catalog.dataminer.services/browse/scripted-connectors";

export default function LocationDetail() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = getLocation(locationId || '');
  const [showNodeLog, setShowNodeLog] = useState(false);
  const [connectorLogId, setConnectorLogId] = useState<string | null>(null);
  const [expandedConnector, setExpandedConnector] = useState<string | null>(null);

  if (!location) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Location not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  const node = location.nodes[0]; // one node per location for now

  const handleRemoveConnector = (connectorId: string) => {
    toast({ title: "Connector removed", description: `${connectorId} has been removed (prototype).` });
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    toast({ title: "Schedule removed", description: `${scheduleId} has been removed (prototype).` });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Overview</button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{location.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Location + Node info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">{location.name}</h1>
            </div>
            {location.description && (
              <p className="text-sm text-muted-foreground mt-1 ml-8">{location.description}</p>
            )}
          </div>

          {/* Node health section */}
          {node && (
            <Card className="shadow-sm">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-muted-foreground" />
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <InfoCard label="Last Packet" value={formatDistanceToNow(new Date(node.lastPacketReceived)) + ' ago'} />
                  <InfoCard label="Bandwidth" value={node.bandwidthKbps > 0 ? `${(node.bandwidthKbps / 1000).toFixed(1)} Mbps` : 'N/A'} />
                  <InfoCard label="Accepted" value={node.packetStats.accepted.toLocaleString()} />
                  <InfoCard label="Dropped" value={node.packetStats.dropped.toLocaleString()} />
                </div>
                <BufferStatus stats={node.packetStats} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:w-56">
          {node && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowNodeLog(true)}>
                <FileText className="w-3 h-3 mr-2" /> Collect Node Logs
              </Button>
              <RevokeNodeDialog
                nodeName={node.name}
                onRevoke={() => toast({ title: "Node revoked", description: `${node.name} keys have been revoked.` })}
              />
              <BanNodeDialog
                nodeName={node.name}
                onBan={() => toast({ title: "Node banned", description: `${node.name} has been banned and will be disconnected.`, variant: "destructive" })}
              />
            </>
          )}
          <DeployConnectorDialog />
          <Button variant="outline" size="sm" asChild>
            <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">
              <Blocks className="w-3 h-3 mr-2" /> Browse Catalog
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </Button>
        </div>
      </div>

      {showNodeLog && node && <LogViewer title={node.name} onClose={() => setShowNodeLog(false)} />}

      <BandwidthChart title={`Bandwidth — ${location.name} (24h)`} />

      {/* Connectors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scripted Connectors</h2>
          <span className="text-xs text-muted-foreground">{location.connectors.length} deployed</span>
        </div>
        <div className="space-y-3">
          {location.connectors.map(connector => (
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
    <div className="bg-muted/50 rounded-md px-3 py-2">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono font-semibold mt-0.5">{value}</p>
    </div>
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

          <BufferStatus stats={connector.packetStats} />

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Arguments</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(connector.arguments).map(([key, val]) => (
                <div key={key} className="flex gap-2 items-center">
                  <Label className="text-xs w-24 text-muted-foreground shrink-0">{key}</Label>
                  <Input className="h-8 text-xs font-mono" defaultValue={val} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedules</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
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

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onToggleLog}>
              <FileText className="w-3 h-3 mr-1" /> {showLog ? 'Hide Logs' : 'Collect Logs'}
            </Button>
            <Button size="sm">
              <Settings className="w-3 h-3 mr-1" /> Save Changes
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={onRemove}>
              <Trash2 className="w-3 h-3 mr-1" /> Remove
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
    <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch defaultChecked={schedule.enabled} />
          <span className="text-sm font-medium">{schedule.name}</span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            <Clock className="w-2.5 h-2.5 mr-1" />
            {schedule.cron}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {schedule.lastRun && (
        <div className="text-[11px] text-muted-foreground flex gap-4">
          <span>Last: {formatDistanceToNow(new Date(schedule.lastRun))} ago</span>
          {schedule.nextRun && <span>Next: {formatDistanceToNow(new Date(schedule.nextRun))}</span>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {Object.entries(schedule.arguments).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <Label className="text-xs w-24 text-muted-foreground shrink-0">{key}</Label>
            <Input className="h-7 text-[11px] font-mono" defaultValue={val} />
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
          <p className="text-xs text-muted-foreground">Arguments (key-value pairs)</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input className="h-8 text-xs" placeholder="Key (e.g. targetIp)" />
              <Input className="h-8 text-xs" placeholder="Value (e.g. 10.0.0.1)" />
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              <Plus className="w-3 h-3 mr-1" /> Add Argument
            </Button>
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              Browse the Catalog for available connectors <ExternalLink className="w-3 h-3" />
            </a>
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
