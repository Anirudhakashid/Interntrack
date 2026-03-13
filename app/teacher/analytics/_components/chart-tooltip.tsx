export function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111318] text-white rounded-lg px-3 py-2 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-white/70">
            {entry.name || entry.dataKey}:{" "}
            <span className="text-white font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function PieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111318] text-white rounded-lg px-3 py-2 shadow-xl text-sm">
        <p className="font-semibold">
          {payload[0].name}:{" "}
          <span className="text-white/70">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export function ChartLegend({
  items,
  type = "dot",
}: {
  items: { label: string; color: string }[];
  type?: "dot" | "sq";
}) {
  return (
    <div className="flex items-center gap-3.5 flex-wrap mt-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-xs text-[#878c97] font-medium"
        >
          <div
            className={
              type === "sq"
                ? "w-2.5 h-2.5 rounded-sm flex-shrink-0"
                : "w-2 h-2 rounded-full flex-shrink-0"
            }
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function NoChartData({ message }: { message: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center text-center">
      <p className="text-sm text-[#878c97]">{message}</p>
    </div>
  );
}
