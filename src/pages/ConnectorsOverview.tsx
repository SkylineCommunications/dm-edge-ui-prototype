import { useNavigate } from "react-router-dom";
import { allConnectors, locations } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Clock, Blocks, ArrowRight } from "lucide-react";

const CATALOG_URL = "https://catalog.dataminer.services/browse/scripted-connectors";

export default function ConnectorsOverview() {
  const navigate = useNavigate();

  const statusDot: Record<string, string> = {
    running: 'bg-success',
    error: 'bg-destructive',
    stopped: 'bg-muted-foreground',
  };

  const statusLabel: Record<string, string> = {
    running: 'Running',
    error: 'Error',
    stopped: 'Stopped',
  };

  const getLocationName = (locationId: string) =>
    locations.find(l => l.id === locationId)?.name ?? locationId;

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scripted Connectors</h1>
          <p className="text-sm text-muted-foreground mt-1">All connectors deployed across your locations</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">
            <Blocks className="w-3.5 h-3.5 mr-2" />
            Browse Catalog
            <ExternalLink className="w-3 h-3 ml-1.5" />
          </a>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: allConnectors.length, color: 'text-foreground' },
          { label: 'Running', value: allConnectors.filter(c => c.status === 'running').length, color: 'text-success' },
          { label: 'Error', value: allConnectors.filter(c => c.status === 'error').length, color: 'text-destructive' },
          { label: 'Schedules', value: allConnectors.reduce((s, c) => s + c.schedules.length, 0), color: 'text-primary' },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connector list */}
      <div className="space-y-3">
        {allConnectors.map(connector => (
          <Card
            key={connector.id}
            className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all shadow-sm"
            onClick={() => navigate(`/locations/${connector.locationId}`)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[connector.status]}`} />
                    <h3 className="font-semibold text-sm">{connector.name}</h3>
                    <Badge variant="secondary" className="text-[10px] font-mono">v{connector.version}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">{statusLabel[connector.status]}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground ml-5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {getLocationName(connector.locationId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {connector.schedules.filter(s => s.enabled).length} active schedule(s)
                    </span>
                    <span className="font-mono">
                      {connector.bandwidthKbps > 0 ? `${(connector.bandwidthKbps / 1000).toFixed(1)} Mbps` : '—'}
                    </span>
                  </div>
                  {connector.lastError && (
                    <div className="text-xs text-destructive mt-1.5 ml-5 font-mono">⚠ {connector.lastError}</div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Catalog CTA */}
      <Card className="border-primary/20 shadow-sm bg-primary/[0.02]">
        <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Looking for more connectors?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Browse the DataMiner Catalog for ready-to-deploy scripted connectors.</p>
          </div>
          <Button size="sm" asChild>
            <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">
              Open Catalog <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
