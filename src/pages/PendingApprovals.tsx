import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pendingNodes } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PendingApprovals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nodes, setNodes] = useState(pendingNodes);
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});

  const handleApprove = (id: string) => {
    if (!nodeNames[id]) {
      toast({ title: "Node name required", description: "Please assign a node name before approving.", variant: "destructive" });
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Node approved", description: `Node approved as "${nodeNames[id]}"` });
  };

  const handleReject = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Node rejected", description: `Node has been rejected.` });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/nodes')} className="text-primary hover:underline">Nodes</button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">Pending Approvals</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve newly registered Edge Nodes</p>
      </div>

      {nodes.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            No pending nodes. All caught up!
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {nodes.map(node => (
          <Card key={node.id} className="shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-sm">{node.name}</h3>
                    <StatusIndicator status="pending" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono">{node.ipAddress}</span>
                    <span>v{node.version}</span>
                    <span>Registered {formatDistanceToNow(new Date(node.registeredAt!))} ago</span>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`node-${node.id}`} className="text-xs">Node Name</Label>
                    <Input
                      id={`node-${node.id}`}
                      placeholder="e.g. Edge Brussels 01"
                      className="h-8 text-sm w-48"
                      value={nodeNames[node.id!] || ''}
                      onChange={(e) => setNodeNames(prev => ({ ...prev, [node.id!]: e.target.value }))}
                    />
                  </div>
                  <Button size="sm" onClick={() => handleApprove(node.id!)}>
                    <Check className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(node.id!)}>
                    <X className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
