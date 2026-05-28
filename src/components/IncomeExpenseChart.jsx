// ============================================================
// LEARN: Recharts uses a "composable" API — you build charts
// by nesting components inside each other, like HTML elements.
// The pattern is always:
//   <ResponsiveContainer>   ← makes chart fill its parent
//     <BarChart data={...}> ← defines chart type + data
//       <CartesianGrid />   ← optional grid lines
//       <XAxis />           ← x-axis config
//       <YAxis />           ← y-axis config
//       <Tooltip />         ← hover tooltip
//       <Legend />          ← color legend
//       <Bar dataKey="..." />  ← one bar series per dataKey
//     </BarChart>
//   </ResponsiveContainer>
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fmtINR, fmtINRCompact } from "../utils/format";

// LEARN: Custom Tooltip — Recharts lets you replace the default
// tooltip with any React component. It receives `active`,
// `payload` (array of data points), and `label` (x-axis value).
const CustomTooltip = ({ active, payload, label }) => {
  // `active` is true only when the user is hovering over a bar
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {/* payload is an array — one entry per Bar in the chart */}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {fmtINR(entry.value)}
        </p>
      ))}
    </div>
  );
};

const IncomeExpenseChart = ({ data }) => {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Income vs Expenses</h2>
        <p className="chart-card__subtitle">Last 6 months overview</p>
      </div>

      {/* LEARN: ResponsiveContainer takes width="100%" and a fixed
          height. It uses a ResizeObserver under the hood to make
          the chart re-render when the container resizes. */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          // barCategoryGap = gap between groups of bars (as % of band width)
          barCategoryGap="25%"
          // barGap = gap between bars within the same group (px)
          barGap={4}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* CartesianGrid adds the subtle background lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          {/* XAxis: dataKey tells it which field to use as the label */}
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* YAxis: tickFormatter formats numbers (125000 → ₹1.25L) */}
          <YAxis
            tickFormatter={fmtINRCompact}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          {/* Tooltip: we pass our custom component */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--hover-bg)" }} />

          {/* Legend: shows color swatches + names */}
          <Legend
            wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            iconType="circle"
            iconSize={8}
          />

          {/* LEARN: Each <Bar> maps to one key in your data objects.
              radius=[4,4,0,0] rounds the top corners of each bar. */}
          <Bar dataKey="income"   name="Income"   fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
