import { useNavigate } from "react-router-dom";
import { allNodes, allConnectors, nodeViews, pendingNodes } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BufferStatus } from "@/components/BufferStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Wifi, AlertTriangle, ArrowRight, Activity, ExternalLink, WifiZero, WifiOff } from "lucide-react";

export default function Overview() {
  const navigate = useNavigate();
  const onlineCount = allNodes.filter(n => n.status === 'online').length;
  const recoveringCount = allNodes.filter(n => n.status === 'recovering').length;
  const offlineCount = allNodes.filter(n => n.status === 'offline').length;
  const nonOnlineNodeViews = nodeViews.filter((item) => item.node?.status !== 'online');

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Nodes and scripted connectors at a glance</p>
      </div>

         
      <div>
       
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Nodes', value: allNodes.length, icon: Cpu, color: 'text-foreground' },
            { label: 'Online', value: onlineCount, icon: Wifi, color: 'text-success' },
            { label: 'Recovering', value: recoveringCount, icon: Activity, color: 'text-warning' },
            { label: 'Offline', value: offlineCount, icon: WifiOff, color: 'text-destructive' },
          ].map(stat => (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className="w-6 h-6 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


      {pendingNodes.length > 0 && (
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{pendingNodes.length} node(s) awaiting approval</span>
            </div>
            <Button size="sm" onClick={() => navigate('/approvals')}>
              Review <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Nodes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Nodes</h2>

              <button
                onClick={() => navigate('/nodes')}
                className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors"
                title="View all nodes"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Recovering and offline nodes</p>
          </div>
          <span className="text-xs text-muted-foreground">{allConnectors.length} connectors across {nodeViews.length} nodes</span>
       
        </div>
        <div className="space-y-3">
          {nonOnlineNodeViews.map((item) => {
            const node = item.node;
            const hasErrors = item.connectors.some((c) => c.status === 'error');
            const isRecovering = node?.packetStats.isRecovering;

            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all shadow-sm"
                onClick={() => navigate(`/nodes/${item.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                          <Cpu className="w-4 h-4 text-primary shrink-0" />
                        <h3 className="font-semibold text-sm">{item.displayName}</h3>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground ml-7">
                        {node && <span className="font-mono">{node.ipAddress}</span>}
                        {node && <span>v{node.version}</span>}
                        <span>{item.connectors.length} connector(s)</span>
                        <span>{item.connectors.filter((c) => c.schedules.some((s) => s.enabled)).length} active schedule(s)</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
                      {node && <StatusIndicator status={node.status} />}
                      {hasErrors && <Badge variant="destructive" className="text-[10px]">Error</Badge>}
                      <ArrowRight className="w-4 h-4 text-muted-foreground hidden lg:block" />
                    </div>
                  </div>
                  {isRecovering && node && (
                    <div className="mt-3 pt-3 border-t">
                      <BufferStatus stats={node.packetStats} showPacketCounts={false} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
