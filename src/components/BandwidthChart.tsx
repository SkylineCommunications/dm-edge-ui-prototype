import { bandwidthHistory } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function BandwidthChart({ title }: { title?: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">{title || "Bandwidth (24h)"}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={bandwidthHistory}>
          <defs>
            <linearGradient id="bandwidthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(211, 100%, 40%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(211, 100%, 40%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(220, 13%, 80%)" />
          <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 13%, 80%)" tickFormatter={(v) => `${v}kb`} />
          <Tooltip
            contentStyle={{
              background: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 13%, 91%)',
              borderRadius: '6px',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <Area type="monotone" dataKey="bandwidth" stroke="hsl(211, 100%, 40%)" fill="url(#bandwidthGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
