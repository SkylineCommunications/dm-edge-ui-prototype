import { useNavigate } from "react-router-dom";
import { mockNodes, pendingNodes } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BufferStatus } from "@/components/BufferStatus";
import { BandwidthChart } from "@/components/BandwidthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Wifi, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Overview() {
  const navigate = useNavigate();
  const onlineCount = mockNodes.filter(n => n.status === 'online').length;
  const recoveringCount = mockNodes.filter(n => n.status === 'recovering').length;
  const offlineCount = mockNodes.filter(n => n.status === 'offline').length;
  const totalConnectors = mockNodes.reduce((s, n) => s + n.connectors.length, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edge Node Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and manage your DataMiner Edge infrastructure</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Nodes</p>
                <p className="text-3xl font-bold font-mono mt-1">{mockNodes.length}</p>
              </div>
              <Server className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Online</p>
                <p className="text-3xl font-bold font-mono mt-1 text-success">{onlineCount}</p>
              </div>
              <Wifi className="w-8 h-8 text-success/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Recovering</p>
                <p className="text-3xl font-bold font-mono mt-1 text-warning">{recoveringCount}</p>
              </div>
              <Activity className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending Approval</p>
                <p className="text-3xl font-bold font-mono mt-1 text-warning">{pendingNodes.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals banner */}
      {pendingNodes.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">{pendingNodes.length} node(s) awaiting approval</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/approvals')}>
              Review <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Node list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Active Nodes</h2>
          <span className="text-xs text-muted-foreground font-mono">{totalConnectors} connectors deployed</span>
        </div>
        <div className="space-y-3">
          {mockNodes.map(node => (
            <Card
              key={node.id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/nodes/${node.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-sm">{node.name}</h3>
                      <StatusIndicator status={node.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>📍 {node.location}</span>
                      <span className="font-mono">{node.ipAddress}</span>
                      <span>v{node.version}</span>
                      <span>{node.connectors.length} connector(s)</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 lg:items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Last packet: </span>
                      <span className="font-mono">{formatDistanceToNow(new Date(node.lastPacketReceived))} ago</span>
                    </div>
                    <div className="text-xs font-mono text-primary">
                      {node.bandwidthKbps > 0 ? `${(node.bandwidthKbps / 1000).toFixed(1)} Mbps` : '—'}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground hidden lg:block" />
                  </div>
                </div>
                {node.packetStats.isRecovering && (
                  <div className="mt-3 pt-3 border-t">
                    <BufferStatus stats={node.packetStats} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BandwidthChart title="Aggregate Bandwidth — All Nodes (24h)" />
    </div>
  );
}
