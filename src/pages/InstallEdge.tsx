import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Download, Key, FileText, CheckCircle2, Copy, Check } from "lucide-react";

type Platform = "deb" | "msi" | "docker";

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

const configSnippets: Record<Platform, { path: string; content: string }> = {
  deb: {
    path: "/etc/dataminer/edge.conf",
    content: `# /etc/dataminer/edge.conf
[General]
OrganisationKey=<YOUR_ORGANISATION_KEY>

[Connection]
DmsEndpoint=https://your-dms.dataminer.services
BufferSize=10000

# After installation, restart the service:
# sudo systemctl restart dataminer-edge`,
  },
  msi: {
    path: "C:\\Program Files\\DataMiner Edge\\edge.conf",
    content: `; C:\\Program Files\\DataMiner Edge\\edge.conf
[General]
OrganisationKey=<YOUR_ORGANISATION_KEY>

[Connection]
DmsEndpoint=https://your-dms.dataminer.services
BufferSize=10000

; After installation, restart via Services or:
; net stop DataMinerEdge && net start DataMinerEdge`,
  },
  docker: {
    path: "docker-compose.yml / environment",
    content: `# docker run
docker run -d \\
  -e DM_ORGANISATION_KEY=<YOUR_ORGANISATION_KEY> \\
  -e DM_DMS_ENDPOINT=https://your-dms.dataminer.services \\
  -e DM_BUFFER_SIZE=10000 \\
  --name dataminer-edge \\
  dataminer/edge:latest

# Or in docker-compose.yml:
# services:
#   edge:
#     image: dataminer/edge:latest
#     environment:
#       DM_ORGANISATION_KEY: <YOUR_ORGANISATION_KEY>
#       DM_DMS_ENDPOINT: https://your-dms.dataminer.services`,
  },
};

export default function InstallEdge() {
  const [platform, setPlatform] = useState<Platform>("deb");
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

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

      {/* Step 2: Organisation Key */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center gap-3">
            <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs font-bold">
              2
            </Badge>
            <CardTitle className="text-base">Get your Organisation Key</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Obtain your Organisation Key from the DataMiner Admin portal. This key authenticates
            the Edge Node with your DataMiner System.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://admin.dataminer.services" target="_blank" rel="noopener noreferrer">
              <Key className="w-3.5 h-3.5 mr-2" />
              Open admin.dataminer.services
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </Button>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
            <p className="font-medium text-foreground mb-1">Where to find the key</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Log in to admin.dataminer.services</li>
              <li>
                Navigate to <span className="font-mono text-foreground">Organisation</span> →{" "}
                <span className="font-mono text-foreground">Keys</span>
              </li>
              <li>Copy an existing Organisation Key or generate a new one</li>
            </ol>
          </div>
          <div className="bg-muted/60 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              <Key className="w-3 h-3" /> Key rotation
            </p>
            <p>
              To rotate keys without downtime, configure a second Organisation Key on the Edge Node
              via{" "}
              <a
                href="https://admin.dataminer.services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                admin.dataminer.services
              </a>
              . Once the node starts using the new key, the old key can be safely revoked.
            </p>
          </div>
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
            {platform === "docker"
              ? "Pass the Organisation Key as an environment variable:"
              : `Edit the configuration file at:`}
          </p>
          {platform !== "docker" && (
            <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
              <code className="text-sm font-mono">{configSnippets[platform].path}</code>
              <CopyButton text={configSnippets[platform].path} id="config-path" />
            </div>
          )}
          <div className="relative">
            <div className="flex items-center justify-between bg-muted/80 rounded-t-lg px-3 py-1.5 border border-b-0 border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-mono">
                  {platform === "docker" ? "Terminal" : configSnippets[platform].path}
                </span>
              </div>
              <CopyButton text={configSnippets[platform].content} id="config-content" />
            </div>
            <pre className="bg-muted rounded-b-lg p-4 text-xs font-mono text-foreground overflow-x-auto border border-t-0 border-border whitespace-pre-wrap">
              {configSnippets[platform].content}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Replace <code className="text-foreground font-mono text-[11px]">&lt;YOUR_ORGANISATION_KEY&gt;</code> with
            the key from Step 2.
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
