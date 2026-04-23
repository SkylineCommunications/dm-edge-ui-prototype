import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDirectDmsSettings, type KeySlot, createGeneratedKey } from "@/lib/directDms";
import { toast } from "@/hooks/use-toast";
import { Check, Copy, Key, RefreshCw, ShieldCheck } from "lucide-react";

const slotLabels: Record<KeySlot, string> = {
  first: "First Key",
  second: "Second Key",
};

const slotDescriptions: Record<KeySlot, string> = {
  first: "Primary key for direct DMS connectivity.",
  second: "Standby key for seamless key rotation without downtime.",
};

export default function Settings() {
  const [settings, setSettings] = useDirectDmsSettings();
  const [copiedSlot, setCopiedSlot] = useState<KeySlot | null>(null);
  const [pendingRegeneration, setPendingRegeneration] = useState<KeySlot | null>(null);

  const generateKey = (slot: KeySlot) => {
    const nextKey = createGeneratedKey();

    setSettings((current) => ({
      ...current,
      keys: {
        ...current.keys,
        [slot]: nextKey,
      },
    }));

    toast({
      title: `${slotLabels[slot]} generated`,
      description:
        slot === "first"
          ? "Use this key on the Edge Node when it connects directly to the DMS."
          : "Configure this second key on the Edge Node before retiring the original key.",
    });
  };

  const handleGenerate = (slot: KeySlot) => {
    if (slot === "second" && !settings.keys.first) {
      toast({
        title: "Generate the first key first",
        description: "Create the primary key before generating a standby second key.",
      });
      return;
    }

    if (settings.keys[slot]) {
      setPendingRegeneration(slot);
      return;
    }

    generateKey(slot);
  };

  const handleCopy = async (slot: KeySlot) => {
    const key = settings.keys[slot];

    if (!key) {
      return;
    }

    await navigator.clipboard.writeText(key.value);
    setCopiedSlot(slot);
    window.setTimeout(() => setCopiedSlot((current) => (current === slot ? null : current)), 2000);

    toast({
      title: `${slotLabels[slot]} copied`,
      description: "The generated key has been copied to the clipboard.",
    });
  };

  return (
    <>
      <div className="space-y-6 animate-slide-up max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage direct DMS onboarding keys for Edge Nodes that have IP connectivity to the DataMiner System.
          </p>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Connection Modes</CardTitle>
                <CardDescription className="mt-1 max-w-3xl">
                  Organisation Keys remain the default onboarding path and only require outbound access to dataminer.services.
                  The direct DMS keys below are for environments where the Edge Node can reach the DMS over IP without going through dataminer.services.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0">Direct DMS</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium">Default: Organisation Key</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Edge Node connects via dataminer.services and only needs access to that service.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium">Alternative: Direct DMS Key</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Edge Node connects directly to the DMS and therefore requires IP connectivity between node and DMS.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Direct DMS Endpoint</CardTitle>
            <CardDescription>
              This endpoint is reused automatically in the direct-connection install wizard to keep node setup copy-paste ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={settings.endpoint}
              onChange={(event) => {
                const nextEndpoint = event.target.value;
                setSettings((current) => ({
                  ...current,
                  endpoint: nextEndpoint,
                }));
              }}
              placeholder="wss://dms.dataminer.local"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Set the reachable DMS URL or IP once here. The direct install flow will insert it automatically together with the first generated key.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Direct DMS Key Management
            </CardTitle>
            <CardDescription>
              The first key is provisioned by default. Generate a second key for controlled rotation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {(["first", "second"] as KeySlot[]).map((slot, index) => {
              const key = settings.keys[slot];
              const isGenerated = Boolean(key);

              return (
                <div key={slot} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold">{slotLabels[slot]}</h2>
                        <Badge variant={slot === "first" ? "default" : "outline"}>
                          {slot === "first" ? "Primary" : "Standby"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{slotDescriptions[slot]}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleGenerate(slot)}>
                      <RefreshCw className="w-3 h-3 mr-2" />
                      {isGenerated ? "Regenerate" : "Generate"}
                    </Button>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Generated Key</label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={key?.value ?? "No key generated yet"}
                          className="h-9 font-mono text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          disabled={!key}
                          onClick={() => void handleCopy(slot)}
                        >
                          {copiedSlot === slot ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          {copiedSlot === slot ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                      <span>
                        {key ? `Generated ${key.createdAt}` : "Generate this key when the DMS will accept direct Edge Node connections."}
                      </span>
                      {slot === "second" && !settings.keys.first && (
                        <span className="text-warning">Primary key required first</span>
                      )}
                    </div>
                  </div>

                  {index === 0 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> How to use these keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Use the first key when onboarding an Edge Node that connects directly to the DMS.</p>
            <p>Generate the second key before rotating credentials, then update the node to use it before retiring the original key.</p>
            <p>Regenerating either key will force nodes using that key to disconnect until they are updated.</p>
            <p>The Organisation Key flow remains the preferred default whenever the node only has access to dataminer.services.</p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={pendingRegeneration !== null} onOpenChange={(open) => !open && setPendingRegeneration(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate key?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRegeneration
                ? `${slotLabels[pendingRegeneration]} will be replaced immediately. Any Edge Nodes still using this key will disconnect until they are updated with the new key.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingRegeneration) {
                  return;
                }

                generateKey(pendingRegeneration);
                setPendingRegeneration(null);
              }}
            >
              Regenerate key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}