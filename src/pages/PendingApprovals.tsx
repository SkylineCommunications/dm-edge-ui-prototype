import { useState } from "react";
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
  const { toast } = useToast();
  const [nodes, setNodes] = useState(pendingNodes);
  const [locations, setLocations] = useState<Record<string, string>>({});

  const handleApprove = (id: string) => {
    if (!locations[id]) {
      toast({ title: "Location required", description: "Please assign a location name before approving.", variant: "destructive" });
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Node approved", description: `Node approved with location "${locations[id]}"` });
  };

  const handleReject = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Node rejected", description: `Node has been rejected.` });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
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
                    <Label htmlFor={`loc-${node.id}`} className="text-xs">Location Name</Label>
                    <Input
                      id={`loc-${node.id}`}
                      placeholder="e.g. NYC Warehouse"
                      className="h-8 text-sm w-48"
                      value={locations[node.id!] || ''}
                      onChange={(e) => setLocations(prev => ({ ...prev, [node.id!]: e.target.value }))}
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
