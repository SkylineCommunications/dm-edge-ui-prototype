import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nodeViews, pendingNodes } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BufferStatus } from "@/components/BufferStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, Plus, AlertTriangle, ArrowUpRight } from "lucide-react";

export default function Locations() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNodes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return nodeViews;
    return nodeViews.filter((item) => item.displayName.toLowerCase().includes(query));
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nodes</h1>
          <p className="text-sm text-muted-foreground mt-1">All registered edge nodes and their connectors</p>
        </div>
        <Button asChild>
          <a href="https://aka.dataminer.services/EdgeNodeInstallation" target="_blank" rel="noopener noreferrer">
            <Plus className="w-4 h-4 mr-2" />
            Add Node <ArrowUpRight className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </div>

      {/* Pending banner */}
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

      <div className="flex justify-end">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by node name"
          aria-label="Search nodes"
          className="w-full max-w-sm bg-muted"
        />
      </div>

      <div className="space-y-3">
        {filteredNodes.map((item) => {
          const node = item.node;
          const totalBw = item.connectors.reduce((s, c) => s + c.bandwidthKbps, 0);
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
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-sm">{item.displayName}</h3>
                      {node && <StatusIndicator status={node.status} />}
                      {hasErrors && <Badge variant="destructive" className="text-[10px]">Error</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground ml-7">
                      {node && <span className="font-mono">{node.ipAddress}</span>}
                      {node && <span>v{node.version}</span>}
                      <span>{item.connectors.length} connector(s)</span>
                      <span>{item.connectors.filter((c) => c.schedules.some((s) => s.enabled)).length} active schedule(s)</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 lg:items-center">
                    <div className="text-xs font-mono text-primary font-medium">
                      {totalBw > 0 ? `${(totalBw / 1000).toFixed(1)} Mbps` : '—'}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground hidden lg:block" />
                  </div>
                </div>
                {isRecovering && node && (
                  <div className="mt-3 pt-3 border-t">
                    <BufferStatus stats={node.packetStats} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredNodes.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No nodes found for "{searchTerm}".
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
