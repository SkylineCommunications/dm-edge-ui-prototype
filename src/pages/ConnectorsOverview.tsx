import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { allConnectors, getNodeView } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, MapPin, Clock, ChevronsLeftRightEllipsis, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";

const CATALOG_URL = "https://catalog.dataminer.services/browse?t=Connector";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedConnectors, setExpandedConnectors] = useState<Record<string, boolean>>({});

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
  const connectorsByName = useMemo(
    () => allConnectors.reduce((acc, c) => {
      if (!acc[c.name]) acc[c.name] = [];
      acc[c.name].push(c);
      return acc;
    }, {} as Record<string, typeof allConnectors>),
    [],
  );

  const deployedConnectorNames = Object.keys(connectorsByName);
  const query = searchTerm.trim().toLowerCase();
  const filteredDeployedConnectorNames = deployedConnectorNames.filter((name) =>
    !query || name.toLowerCase().includes(query),
  );
  const availableToDeploy = centralAvailableConnectors.filter(
    (item) => !deployedConnectorNames.includes(item.name),
  );
  const filteredAvailableToDeploy = availableToDeploy.filter((item) =>
    !query || item.name.toLowerCase().includes(query),
  );

  const toggleConnector = (name: string) => {
    setExpandedConnectors((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl">
      <div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scripted Connectors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deployed connectors and centrally available connectors
          </p>
        </div>
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

      <div className="flex justify-end">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search scripted connectors"
          aria-label="Search scripted connectors"
          className="w-full max-w-sm bg-muted"
        />
      </div>

      {/* Deployed */}
      <div className="space-y-4">
        {filteredDeployedConnectorNames.map((name) => {
          const instances = connectorsByName[name];
          const isExpanded = expandedConnectors[name] ?? false;
          return (
            <Card key={name} className="shadow-sm">
              <CardContent className="py-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => toggleConnector(name)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <ChevronsLeftRightEllipsis className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{name}</h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {instances.length} deployment{instances.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {isExpanded ? "Hide locations" : "Show locations"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-2 mt-3">
                    {instances.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/70 transition-colors border border-border/50"
                        onClick={() => navigate(`/nodes/${getNodeView(connector.locationId)?.id ?? connector.locationId}`)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[connector.status]}`} />
                          <span className="text-xs text-muted-foreground capitalize shrink-0">{statusLabel[connector.status]}</span>
                          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                            v{connector.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{getLocationName(connector.locationId)}</span>
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> {connector.schedules.filter((s) => s.enabled).length} active
                          </span>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">
                            {connector.bandwidthKbps > 0 ? `${(connector.bandwidthKbps / 1000).toFixed(1)} Mbps` : "—"}
                          </span>
                        </div>
                        {connector.lastError && (
                          <span className="text-xs text-destructive font-mono mr-3 hidden lg:inline truncate max-w-72">⚠ {connector.lastError}</span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredDeployedConnectorNames.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No deployed scripted connectors found for "{searchTerm}".
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available to deploy */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center gap-3">
            <ChevronsLeftRightEllipsis className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Available To Deploy</h3>
            <Badge variant="secondary" className="text-[10px]">
              {filteredAvailableToDeploy.length} connector{filteredAvailableToDeploy.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {filteredAvailableToDeploy.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {query
                ? `No scripted connectors available to deploy match "${searchTerm}".`
                : "All centrally available connectors are already deployed."}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredAvailableToDeploy.map((connector) => (
                <div
                  key={connector.name}
                  className="flex items-center bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      v{connector.version}
                    </Badge>
                    <span className="text-sm font-medium">{connector.name}</span>
                    <span className="text-xs text-muted-foreground">{connector.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-md border border-primary/20 bg-primary/[0.02] p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}