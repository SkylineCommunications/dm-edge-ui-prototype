import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDirectDmsSettings } from "@/lib/directDms";
import { ExternalLink, Download, Key, FileText, CheckCircle2, Copy, Check } from "lucide-react";

type Platform = "deb" | "msi" | "docker";
type ConnectionMode = "organisation" | "direct";

const platforms: { id: Platform; label: string; icon: string; desc: string }[] = [
  { id: "deb", label: "Linux (DEB)", icon: "🐧", desc: "Debian / Ubuntu" },
  { id: "msi", label: "Windows (MSI)", icon: "🪟", desc: "Windows Server" },
  { id: "docker", label: "Docker", icon: "🐳", desc: "Container image" },
];

const downloadLinks: Record<Platform, string> = {
  deb: "https://downloads.dataminer.services/edge/dataminer-edge_latest_amd64.deb",
  msi: "https://downloads.dataminer.services/edge/DataMinerEdge_latest.msi",
  docker: "docker pull dataminer/edge:latest",
};

const configPaths: Record<Platform, string> = {
  deb: "/etc/dataminer/edge.conf",
  msi: "C:\\Program Files\\DataMiner Edge\\edge.conf",
  docker: "docker-compose.yml / environment",
};

function buildConfigSnippets(
  directDmsKey: string,
  directDmsEndpoint: string,
): Record<ConnectionMode, Record<Platform, { path: string; content: string }>> {
  return {
    organisation: {
    deb: {
      path: configPaths.deb,
      content: `# /etc/dataminer/edge.conf
[General]
OrganisationKey=<YOUR_DMS_KEY>

[Connection]
DmsEndpoint=wss://dataminer.services
BufferSize=10000

# After installation, restart the service:
# sudo systemctl restart dataminer-edge`,
    },
    msi: {
      path: configPaths.msi,
      content: `; C:\Program Files\DataMiner Edge\edge.conf
[General]
OrganisationKey=<YOUR_ORGANISATION_KEY>

[Connection]
DmsEndpoint=wss://dataminer.services
BufferSize=10000

; After installation, restart via Services or:
; net stop DataMinerEdge && net start DataMinerEdge`,
    },
    docker: {
      path: configPaths.docker,
      content: `# docker run
docker run -d \\
  -e DM_ORGANISATION_KEY=<YOUR_ORGANISATION_KEY> \\
  -e DM_DMS_ENDPOINT=wss://dataminer.services \\
  -e DM_BUFFER_SIZE=10000 \\
  --name dataminer-edge \\
  dataminer/edge:latest

# Or in docker-compose.yml:
# services:
#   edge:
#     image: dataminer/edge:latest
#     environment:
#       DM_ORGANISATION_KEY: <YOUR_ORGANISATION_KEY>
#       DM_DMS_ENDPOINT: wss://dataminer.services`,
    },
  },
    direct: {
    deb: {
      path: configPaths.deb,
      content: `# /etc/dataminer/edge.conf
[General]
DmsKey=${directDmsKey}

[Connection]
DmsEndpoint=${directDmsEndpoint}
BufferSize=10000

# After installation, restart the service:
# sudo systemctl restart dataminer-edge`,
    },
    msi: {
      path: configPaths.msi,
      content: `; C:\Program Files\DataMiner Edge\edge.conf
[General]
DmsKey=${directDmsKey}

[Connection]
DmsEndpoint=${directDmsEndpoint}
BufferSize=10000

; After installation, restart via Services or:
; net stop DataMinerEdge && net start DataMinerEdge`,
    },
    docker: {
      path: configPaths.docker,
      content: `# docker run
docker run -d \\
  -e DM_DMS_KEY=${directDmsKey} \
  -e DM_DMS_ENDPOINT=${directDmsEndpoint} \
  -e DM_BUFFER_SIZE=10000 \\
  --name dataminer-edge \\
  dataminer/edge:latest

# Or in docker-compose.yml:
# services:
#   edge:
#     image: dataminer/edge:latest
#     environment:
#       DM_DMS_KEY: ${directDmsKey}
#       DM_DMS_ENDPOINT: ${directDmsEndpoint}`,
    },
  },
  };
}

const connectionModeDetails: Record<
  ConnectionMode,
  {
    title: string;
    summary: string;
    requirement: string;
    sourceTitle: string;
    sourceSteps: string[];
    note?: string;
  }
> = {
  organisation: {
    title: "Default route via dataminer.services",
    summary:
      "Use an DMS Key when the Edge Node connects to the DataMiner System through dataminer.services. This is the default onboarding flow.",
    requirement: "The Edge Node only needs outbound access to dataminer.services.",
    sourceTitle: "Where to find the key",
    sourceSteps: [
      "Log in to admin.dataminer.services",
      "Under DataMiner Systems, expand the target DataMiner System and navigate to Keys.",
      "Copy an existing Primary Key or generate a new one.",
    ],
    note:
      "To rotate keys without downtime, configure a second DMS Key on the Edge Node from the location detail page in this UI. Once the node starts using the new key, the old key can be released via admin.dataminer.services.",
  },
  direct: {
    title: "Direct route to the DMS",
    summary:
      "Use this alternative only when needed: the Edge Node connects directly to the DataMiner System with a local key instead of using the recommended dataminer.services route.",
    requirement: "This option requires IP connectivity between the Edge Node and the DMS.",
    sourceTitle: "How to prepare direct onboarding",
    sourceSteps: [
      "Confirm the first direct DMS key in Settings",
      "Confirm the saved DMS endpoint in Settings",
      "Copy the ready-made configuration below to the Edge Node",
    ],
  },
};

export default function InstallEdge() {
  const [platform, setPlatform] = useState<Platform>("deb");
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("organisation");
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [directDmsSettings] = useDirectDmsSettings();

  const configSnippets = buildConfigSnippets(
    directDmsSettings.keys.first?.value ?? "<YOUR_DMS_KEY>",
    directDmsSettings.endpoint,
  );

  const selectedConfig = configSnippets[connectionMode][platform];
  const selectedModeDetails = connectionModeDetails[connectionMode];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs gap-1"
      onClick={() => handleCopy(text, id)}
    >
      {copiedStep === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copiedStep === id ? "Copied" : "Copy"}
    </Button>
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Install Edge Node</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follow these steps to install and register a new DataMiner Edge Node
        </p>
      </div>

      {/* Platform selector */}
      <div className="grid grid-cols-3 gap-3">
        {platforms.map((p) => (
          <Card
            key={p.id}
            className={`cursor-pointer transition-all shadow-sm hover:shadow-md ${
              platform === p.id
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/30"
            }`}
            onClick={() => setPlatform(p.id)}
          >
            <CardContent className="py-4 text-center">
              <span className="text-2xl">{p.icon}</span>
              <p className="text-sm font-semibold mt-2">{p.label}</p>
              <p className="text-[11px] text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step 1: Download */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs font-bold">
              1
            </Badge>
            <CardTitle className="text-base">Download the installer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          {platform === "docker" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pull the DataMiner Edge container image from the registry:
              </p>
              <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                <code className="text-sm font-mono">{downloadLinks.docker}</code>
                <CopyButton text={downloadLinks.docker} id="download" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Download the {platform === "deb" ? "Debian package" : "Windows installer"} for your
                Edge Node:
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={downloadLinks[platform]} target="_blank" rel="noopener noreferrer">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download {platform === "deb" ? ".deb package" : ".msi installer"}
                </a>
              </Button>
              {platform === "deb" && (
                <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                  <code className="text-sm font-mono">
                    sudo dpkg -i dataminer-edge_latest_amd64.deb
                  </code>
                  <CopyButton
                    text="sudo dpkg -i dataminer-edge_latest_amd64.deb"
                    id="install-cmd"
                  />
                </div>
              )}
              {platform === "msi" && (
                <p className="text-xs text-muted-foreground">
                  Run the MSI installer and follow the setup wizard. Administrative privileges are
                  required.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Connection method */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs font-bold">
              2
            </Badge>
            <CardTitle className="text-base">Choose how the Edge Node connects</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 space-y-3">
          <Tabs value={connectionMode} onValueChange={(value) => setConnectionMode(value as ConnectionMode)}>
            <TabsList className="grid w-full grid-cols-2 h-auto gap-1 bg-muted/70">
              <TabsTrigger value="organisation" className="py-2 text-left">Organisation Key</TabsTrigger>
              <TabsTrigger value="direct" className="py-2 text-left">Direct DMS Key</TabsTrigger>
            </TabsList>

            <TabsContent value="organisation" className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm space-y-2">
                <p className="font-medium text-foreground">{connectionModeDetails.organisation.title}</p>
                <p className="text-muted-foreground">{connectionModeDetails.organisation.summary}</p>
                <p className="text-xs text-foreground">{connectionModeDetails.organisation.requirement}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://admin.dataminer.services" target="_blank" rel="noopener noreferrer">
                  <Key className="w-3.5 h-3.5 mr-2" />
                  Open admin.dataminer.services
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="direct" className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm space-y-2">
                <p className="font-medium text-foreground">{connectionModeDetails.direct.title}</p>
                <p className="text-muted-foreground">{connectionModeDetails.direct.summary}</p>
                <p className="text-xs text-foreground">{connectionModeDetails.direct.requirement}</p>
              </div>
              <div className="bg-muted/60 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-2">
                <p>
                  The direct configuration below is pre-filled with the first generated DMS key and the saved DMS endpoint from Settings.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings">Open Settings</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-muted/60 border border-border rounded-lg p-3 text-sm space-y-2">
            <p className="font-medium text-foreground">{selectedModeDetails.sourceTitle}</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              {selectedModeDetails.sourceSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          {selectedModeDetails.note && (
            <div className="bg-muted/60 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground flex items-center gap-1.5">
                <Key className="w-3 h-3" /> Key rotation
              </p>
              <p>
                To rotate keys without downtime, configure a second Organisation Key on the Edge Node
                from the location detail page in this UI. Once the node starts using the new key,
                the old key can be released via{" "}
                <a
                  href="https://admin.dataminer.services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  admin.dataminer.services
                </a>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Configure */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs font-bold">
              3
            </Badge>
            <CardTitle className="text-base">Add the key to the configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {connectionMode === "organisation"
              ? platform === "docker"
                ? "Pass the Organisation Key as an environment variable:"
                : "Edit the configuration file and add the Organisation Key:"
              : platform === "docker"
                ? "Pass the DMS key and direct endpoint as environment variables:"
                : "Edit the configuration file and add the DMS key with the direct endpoint:"}
          </p>
          {platform !== "docker" && (
            <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
              <code className="text-sm font-mono">{selectedConfig.path}</code>
              <CopyButton text={selectedConfig.path} id="config-path" />
            </div>
          )}
          <div className="relative">
            <div className="flex items-center justify-between bg-muted/80 rounded-t-lg px-3 py-1.5 border border-b-0 border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-mono">
                  {platform === "docker" ? "Terminal" : selectedConfig.path}
                </span>
              </div>
              <CopyButton text={selectedConfig.content} id="config-content" />
            </div>
            <pre className="bg-muted rounded-b-lg p-4 text-xs font-mono text-foreground overflow-x-auto border border-t-0 border-border whitespace-pre-wrap">
              {selectedConfig.content}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            {connectionMode === "organisation" ? (
              <>
                Replace <code className="text-foreground font-mono text-[11px]">&lt;YOUR_ORGANISATION_KEY&gt;</code> with the
                key from Step 2.
              </>
            ) : (
              <>
                The configuration already includes the first generated DMS key and saved <code className="text-foreground font-mono text-[11px]">DmsEndpoint</code> from Settings.
                Update them on the <Link to="/settings" className="text-primary hover:underline">Settings page</Link> if the target DMS changes.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Step 4: What happens next */}
      <Card className="shadow-sm border-primary/20">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <CardTitle className="text-base">What happens next?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>
              The Edge Node starts and <strong className="text-foreground">registers itself</strong> with
              the DataMiner System.
            </li>
            <li>
              The node appears on the{" "}
              <strong className="text-foreground">Pending Approvals</strong> page.
            </li>
            <li>
              An administrator <strong className="text-foreground">approves</strong> the node and
              assigns it a <strong className="text-foreground">location name</strong>.
            </li>
            <li>
              Once approved, you can{" "}
              <strong className="text-foreground">deploy Scripted Connectors</strong> to the location
              from the{" "}
              <a
                href="https://catalog.dataminer.services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DataMiner Catalog
              </a>
              .
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
