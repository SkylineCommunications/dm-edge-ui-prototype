import { useNavigate } from "react-router-dom";
import { mockNodes } from "@/data/mockData";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NodeList() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edge Nodes</h1>
        <p className="text-sm text-muted-foreground mt-1">All approved nodes in your DataMiner System</p>
      </div>

      <div className="space-y-3">
        {mockNodes.map(node => (
          <Card
            key={node.id}
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate(`/nodes/${node.id}`)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-sm">{node.name}</h3>
                    <StatusIndicator status={node.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    <span>📍 {node.location}</span>
                    <span className="font-mono">{node.ipAddress}</span>
                    <span>v{node.version}</span>
                    <span>{node.connectors.length} connector(s)</span>
                    <span>Last: {formatDistanceToNow(new Date(node.lastPacketReceived))} ago</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
