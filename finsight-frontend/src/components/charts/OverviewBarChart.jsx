import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

function fmt(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v}`;
}

export default function OverviewBarChart({ data = [], height = 140 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={14} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#e2ddd3" strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#b0ab9e", fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: "#b0ab9e", fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip
          formatter={(value, name) => [
            new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
          contentStyle={{
            background: "#fff",
            border:     "1px solid #d6d1c6",
            borderRadius: "4px",
            fontSize:   "12px",
            fontFamily: "DM Sans",
          }}
        />
        <Bar dataKey="income"   fill="#cce4d6" radius={[2, 2, 0, 0]} name="income"   />
        <Bar dataKey="expenses" fill="#f0d0ce" radius={[2, 2, 0, 0]} name="expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
