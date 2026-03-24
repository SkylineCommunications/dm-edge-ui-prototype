import { bandwidthHistory } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function BandwidthChart({ title }: { title?: string }) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-4">{title || "Bandwidth (24h)"}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={bandwidthHistory}>
          <defs>
            <linearGradient id="bandwidthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 35%)" />
          <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 35%)" tickFormatter={(v) => `${v}kb`} />
          <Tooltip
            contentStyle={{
              background: 'hsl(215, 25%, 13%)',
              border: '1px solid hsl(215, 20%, 22%)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Area type="monotone" dataKey="bandwidth" stroke="hsl(174, 72%, 46%)" fill="url(#bandwidthGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
