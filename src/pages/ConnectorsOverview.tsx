import { useNavigate } from "react-router-dom";
import { allConnectors, getNodeView } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Clock, Blocks, ArrowRight } from "lucide-react";

const CATALOG_URL = "https://catalog.dataminer.services/browse/scripted-connectors";

const centralAvailableConnectors = [
  { name: "SNMP Poller", version: "2.2.0", category: "Network" },
  { name: "HTTP Health Check", version: "1.1.0", category: "Web" },
  { name: "Modbus TCP Reader", version: "3.0.2", category: "Industrial" },
  { name: "OPC UA Client", version: "1.2.1", category: "Industrial" },
  { name: "MQTT Subscriber", version: "1.0.0", category: "Messaging" },
  { name: "Syslog Collector", version: "1.0.0", category: "Logs" },
  { name: "SFTP File Ingest", version: "0.9.1", category: "Files" },
];

export default function ConnectorsOverview() {
  const navigate = useNavigate();

  const statusDot: Record<string, string> = {
    running: "bg-success",
    error: "bg-destructive",
    stopped: "bg-muted-foreground",
  };

  const statusLabel: Record<string, string> = {
    running: "Running",
    error: "Error",
    stopped: "Stopped",
  };

  const getLocationName = (locationId: string) =>
    getNodeView(locationId)?.displayName ?? locationId;

  // Group deployed connectors by name
  const connectorsByName = allConnectors.reduce((acc, c) => {
    if (!acc[c.name]) acc[c.name] = [];
    acc[c.name].push(c);
    return acc;
  }, {} as Record<string, typeof allConnectors>);

  const deployedConnectorNames = Object.keys(connectorsByName);
  const availableToDeploy = centralAvailableConnectors.filter(
    (item) => !deployedConnectorNames.includes(item.name),
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scripted Connectors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deployed connectors and centrally available connectors
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">
            <Blocks className="w-3.5 h-3.5 mr-2" />
            Browse Catalog
            <ExternalLink className="w-3 h-3 ml-1.5" />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Deployments", value: allConnectors.length, color: "text-foreground" },
          { label: "Running", value: allConnectors.filter((c) => c.status === "running").length, color: "text-success" },
          { label: "Error", value: allConnectors.filter((c) => c.status === "error").length, color: "text-destructive" },
          { label: "Deployed Types", value: deployedConnectorNames.length, color: "text-primary" },
          { label: "Available To Deploy", value: availableToDeploy.length, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployed */}
      <div className="space-y-4">
        {deployedConnectorNames.map((name) => {
          const instances = connectorsByName[name];
          return (
            <Card key={name} className="shadow-sm">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <Blocks className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">{name}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {instances.length} deployment{instances.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {instances.map((connector) => (
                    <div
                      key={connector.id}
                      className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/70 transition-colors border border-border/50"
                      onClick={() => navigate(`/nodes/${getNodeView(connector.locationId)?.id ?? connector.locationId}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[connector.status]}`} />
                        <span className="text-xs text-muted-foreground capitalize">{statusLabel[connector.status]}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          v{connector.version}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {getLocationName(connector.locationId)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {connector.schedules.filter((s) => s.enabled).length} active
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {connector.bandwidthKbps > 0 ? `${(connector.bandwidthKbps / 1000).toFixed(1)} Mbps` : "—"}
                        </span>
                      </div>
                      {connector.lastError && (
                        <span className="text-xs text-destructive font-mono mr-3 hidden lg:inline">⚠ {connector.lastError}</span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available to deploy */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center gap-3">
            <Blocks className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Available To Deploy</h3>
            <Badge variant="secondary" className="text-[10px]">
              {availableToDeploy.length} connector{availableToDeploy.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {availableToDeploy.length === 0 ? (
            <p className="text-xs text-muted-foreground">All centrally available connectors are already deployed.</p>
          ) : (
            <div className="space-y-2">
              {availableToDeploy.map((connector) => (
                <div
                  key={connector.name}
                  className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      v{connector.version}
                    </Badge>
                    <span className="text-sm font-medium">{connector.name}</span>
                    <span className="text-xs text-muted-foreground">{connector.category}</span>
                    <Badge variant="outline" className="text-[10px]">
                      Not deployed
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">
                      Deploy <ExternalLink className="w-3 h-3 ml-1.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-sm bg-primary/[0.02]">
        <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Looking for more connectors?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse the DataMiner Catalog for ready-to-deploy scripted connectors.
            </p>
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