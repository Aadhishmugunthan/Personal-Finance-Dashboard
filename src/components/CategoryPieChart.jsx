// ============================================================
// LEARN: PieChart / DonutChart in Recharts
// A "donut" is just a PieChart with innerRadius > 0.
// Key props on <Pie>:
//   data        — array of { name, value, color }
//   dataKey     — which field holds the numeric value
//   nameKey     — which field holds the label
//   cx / cy     — center position (50% = centered)
//   innerRadius — 0 = pie, >0 = donut
//   outerRadius — size of the chart
//   paddingAngle — gap between slices (in degrees)
//
// <Cell> lets you assign a different fill to each slice.
// ============================================================

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmtINR } from "../utils/format";

// Custom label rendered inside each slice
// LEARN: Recharts passes cx, cy, midAngle, innerRadius, outerRadius,
// percent to custom label render functions
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  // Only show label if slice is big enough (>5%)
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  // Calculate the midpoint of the slice arc for label placement
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryPieChart = ({ data }) => {
  // Calculate total for the center label
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Spending by Category</h2>
        <p className="chart-card__subtitle">This month's breakdown</p>
      </div>

      {/* LEARN: We wrap the chart in a relative div so we can
          absolutely position the center text over the donut hole */}
      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}   // ← this creates the donut hole
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {/* LEARN: We map over data to give each slice its own color.
                  Without <Cell>, all slices would be the same color. */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [fmtINR(value), name]}
              contentStyle={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label — positioned over the donut hole */}
        <div className="donut-center">
          <span className="donut-center__label">Total</span>
          <span className="donut-center__value">{fmtINR(total)}</span>
        </div>
      </div>

      {/* Custom legend below the chart */}
      <div className="pie-legend">
        {data.map((item) => (
          <div key={item.name} className="pie-legend__item">
            <span className="pie-legend__dot" style={{ background: item.color }} />
            <span className="pie-legend__name">{item.name}</span>
            <span className="pie-legend__value">{fmtINR(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
