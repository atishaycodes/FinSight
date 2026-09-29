import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/index.js";

export default function CategoryDonutChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[100px] text-[12px] text-ink-4">
        No expense data
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={50}
            paddingAngle={2}
            dataKey="amount"
            nameKey={(item) => item.category?.name ?? "Other"}
          >
            {data.map((item, i) => (
              <Cell key={i} fill={item.category?.color ?? "#b0ab9e"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              formatCurrency(value),
              "",
            ]}
            contentStyle={{
              background:   "#fff",
              border:       "1px solid #d6d1c6",
              borderRadius: "4px",
              fontSize:     "12px",
              fontFamily:   "DM Sans",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 mt-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.category?.color ?? "#b0ab9e" }}
            />
            <span className="text-[11px] text-ink-3 flex-1 truncate">
              {item.category?.name ?? "Other"}
            </span>
            <span className="num text-[12px] font-bold text-ink">
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
