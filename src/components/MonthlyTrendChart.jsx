// ============================================================
// LEARN: AreaChart — like a LineChart but with a filled area
// below the line. Great for showing trends over time.
//
// Key Recharts concepts here:
//   <defs> + <linearGradient> — SVG gradients for the fill area
//   <Area> — the filled line series
//     type="monotone" — smooth curved line (vs "linear" = sharp)
//     fill="url(#gradientId)" — references the SVG gradient
//     stroke — the line color
//     strokeWidth — line thickness
// ============================================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fmtINR, fmtINRCompact } from "../utils/format";

const MonthlyTrendChart = ({ data }) => {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Monthly Trend</h2>
        <p className="chart-card__subtitle">Income & expense flow</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

          {/* LEARN: <defs> is an SVG element for reusable definitions.
              We define two gradients here and reference them by id below.
              x1/y1/x2/y2 define the gradient direction (0,0 → 0,1 = top to bottom) */}
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtINRCompact}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <Tooltip
            formatter={(value, name) => [fmtINR(value), name]}
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />

          <Legend
            wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            iconType="circle"
            iconSize={8}
          />

          {/* LEARN: fill="url(#incomeGradient)" references the <linearGradient>
              we defined in <defs> above. This is standard SVG syntax. */}
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            dot={{ fill: "#6366f1", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
            dot={{ fill: "#f59e0b", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
