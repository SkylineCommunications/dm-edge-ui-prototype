import { useState } from "react";
import { mockLogLines } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, X } from "lucide-react";

interface LogViewerProps {
  title: string;
  onClose: () => void;
}

export function LogViewer({ title, onClose }: LogViewerProps) {
  const [loading, setLoading] = useState(false);
  const [lines] = useState(mockLogLines);

  const handleCollect = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLineClass = (line: string) => {
    if (line.includes('[ERROR]')) return 'text-destructive';
    if (line.includes('[WARN]')) return 'text-warning';
    if (line.includes('[DEBUG]')) return 'text-muted-foreground';
    return 'text-foreground';
  };

  return (
    <div className="bg-card border rounded-lg animate-slide-up">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold">Logs — {title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCollect} disabled={loading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Collect
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 max-h-80 overflow-auto bg-background/50 rounded-b-lg">
        <pre className="text-[11px] font-mono leading-5 space-y-0">
          {lines.map((line, i) => (
            <div key={i} className={`${getLineClass(line)} hover:bg-accent/30 px-1`}>
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
