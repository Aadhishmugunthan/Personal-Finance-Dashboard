// ============================================================
// LEARN: RadialBarChart — a circular progress-style chart.
// Great for showing a single metric against a goal/max.
//
// Key props:
//   innerRadius / outerRadius — ring thickness
//   startAngle / endAngle    — arc sweep (180 = half circle,
//                               360 = full circle)
//   <RadialBar> background   — shows the "empty" track behind
// ============================================================

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { fmtINR } from "../utils/format";

const SavingsProgress = ({ savingsRate, netSavings, goal = 40000 }) => {
  // Build data array for the radial bar
  // LEARN: RadialBarChart expects an array even for a single value
  const data = [{ value: savingsRate, fill: "#6366f1" }];

  // Progress toward monthly savings goal
  const goalProgress = Math.min((netSavings / goal) * 100, 100);

  return (
    <div className="chart-card savings-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">Savings Rate</h2>
        <p className="chart-card__subtitle">% of income saved this month</p>
      </div>

      {/* Radial chart + center label */}
      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            // LEARN: PolarAngleAxis domain sets the max value (100 = 100%)
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            {/* This axis is invisible but tells Recharts the scale (0–100) */}
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: "var(--border)" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center text overlay */}
        <div className="donut-center">
          <span className="donut-center__label">Saved</span>
          <span className="donut-center__value" style={{ color: "#6366f1" }}>
            {savingsRate}%
          </span>
        </div>
      </div>

      {/* Goal progress bar */}
      <div className="savings-goal">
        <div className="savings-goal__header">
          <span>Monthly Goal</span>
          <span>{fmtINR(netSavings)} / {fmtINR(goal)}</span>
        </div>

        {/* LEARN: A simple CSS progress bar — width is set inline
            as a percentage. This is a common UI pattern. */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${goalProgress}%` }}
            role="progressbar"
            aria-valuenow={goalProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <p className="savings-goal__note">
          {goalProgress >= 100
            ? "🎉 Goal reached!"
            : `${fmtINR(goal - netSavings)} more to reach your goal`}
        </p>
      </div>
    </div>
  );
};

export default SavingsProgress;
