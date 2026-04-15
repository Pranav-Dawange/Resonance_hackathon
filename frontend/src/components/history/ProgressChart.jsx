// ============================================
// DermaAI SkinVision — Progress Chart
// Clinical Trend Line with Skincare Milestones
// Uses recharts for professional data visualization
// ============================================

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="glass-card p-3 rounded-xl border border-white/10 min-w-[180px]">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {data.date}
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">IGA Score</span>
          <span className="text-sm font-bold" style={{ color: getIGAColor(data.igaScore) }}>
            {data.igaScore} — {data.igaLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Lesions</span>
          <span className="text-sm font-semibold text-white">{data.lesionCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Inflammatory</span>
          <span className="text-sm font-semibold text-red-400">{data.inflammatoryCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Hyperpig</span>
          <span className="text-sm font-semibold text-amber-400">{data.hyperpigCoverage}%</span>
        </div>
      </div>

      {data.milestone && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-medical-blue-400" />
            <span className="text-[9px] font-semibold text-medical-blue-400">
              {data.milestone.label}
            </span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 ml-3">
            {data.milestone.note}
          </p>
        </div>
      )}
    </div>
  );
}

// Custom milestone dot
function MilestoneDot({ cx, cy, payload }) {
  if (!payload?.milestone) return null;

  return (
    <g>
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={12} fill="rgba(37, 99, 235, 0.15)" stroke="none" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={7} fill="rgba(37, 99, 235, 0.3)" stroke="#2563EB" strokeWidth={2} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="#2563EB" />
    </g>
  );
}

// Custom data point dot
function DataDot({ cx, cy, payload }) {
  const color = getIGAColor(payload?.igaScore);
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#0F172A" strokeWidth={2} />
    </g>
  );
}

function getIGAColor(score) {
  const colors = ['#22C55E', '#86EFAC', '#FBBF24', '#F97316', '#EF4444'];
  return colors[score] || '#22C55E';
}

export default function ProgressChart({ chartData = [] }) {
  if (chartData.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-500">No data available for charting</p>
      </div>
    );
  }

  // Calculate improvement stats
  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const igaImprovement = first.igaScore - last.igaScore;
  const lesionReduction = first.lesionCount - last.lesionCount;
  const hyperpigReduction = (first.hyperpigCoverage - last.hyperpigCoverage).toFixed(1);

  return (
    <div className="glass-card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label">Clinical Trend Line</div>
          <p className="text-xs text-slate-500 mt-0.5">Temporal Feature Ledger</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] bg-medical-blue-400 rounded-full" />
            <span className="text-[9px] text-slate-500">IGA Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] bg-red-400/60 rounded-full" />
            <span className="text-[9px] text-slate-500">Lesions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-medical-blue-500/30 border border-medical-blue-500" />
            <span className="text-[9px] text-slate-500">Milestone</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            {/* Background grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(71, 85, 105, 0.15)"
              vertical={false}
            />

            {/* Axes */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: 'rgba(71, 85, 105, 0.2)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="iga"
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'IGA',
                position: 'insideTopLeft',
                style: { fontSize: 9, fill: '#475569' },
              }}
            />
            <YAxis
              yAxisId="lesions"
              orientation="right"
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Lesions',
                position: 'insideTopRight',
                style: { fontSize: 9, fill: '#475569' },
              }}
            />

            {/* Custom tooltip */}
            <Tooltip content={<CustomTooltip />} cursor={false} />

            {/* IGA target line (Clear = 0) */}
            <ReferenceLine
              yAxisId="iga"
              y={0}
              stroke="rgba(34, 197, 94, 0.3)"
              strokeDasharray="8 4"
              label={{
                value: 'Clear',
                position: 'right',
                style: { fontSize: 9, fill: '#22C55E' },
              }}
            />

            {/* Lesion count bars (subtle background) */}
            <Bar
              yAxisId="lesions"
              dataKey="lesionCount"
              fill="rgba(239, 68, 68, 0.08)"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
              barSize={30}
            />

            {/* IGA Score line — primary */}
            <Line
              yAxisId="iga"
              type="monotone"
              dataKey="igaScore"
              stroke="#2563EB"
              strokeWidth={3}
              dot={<DataDot />}
              activeDot={{ r: 8, fill: '#2563EB', stroke: '#0F172A', strokeWidth: 3 }}
            />

            {/* Milestone markers */}
            {chartData.map((point, i) => point.milestone ? (
              <ReferenceDot
                key={i}
                yAxisId="iga"
                x={point.date}
                y={point.igaScore}
                r={0}
                shape={<MilestoneDot />}
              />
            ) : null)}

            {/* Inflammatory trend line */}
            <Line
              yAxisId="lesions"
              type="monotone"
              dataKey="inflammatoryCount"
              stroke="rgba(239, 68, 68, 0.5)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Improvement summary cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center"
        >
          <div className="text-[9px] text-emerald-500 uppercase tracking-wider mb-1">IGA Reduction</div>
          <div className="text-xl font-bold text-emerald-400">-{igaImprovement}</div>
          <div className="text-[9px] text-slate-500">grades improved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-3 rounded-xl bg-medical-blue-500/5 border border-medical-blue-500/10 text-center"
        >
          <div className="text-[9px] text-medical-blue-400 uppercase tracking-wider mb-1">Lesion Reduction</div>
          <div className="text-xl font-bold text-medical-blue-400">-{lesionReduction}</div>
          <div className="text-[9px] text-slate-500">lesions cleared</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center"
        >
          <div className="text-[9px] text-amber-400 uppercase tracking-wider mb-1">Hyperpig Drop</div>
          <div className="text-xl font-bold text-amber-400">-{hyperpigReduction}%</div>
          <div className="text-[9px] text-slate-500">coverage reduced</div>
        </motion.div>
      </div>

      {/* Milestones timeline */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="section-label mb-2">Skincare Milestones</div>
        <div className="space-y-2">
          {chartData.filter(d => d.milestone).map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-medical-blue-500 border-2 border-clinical-base shadow-[0_0_6px_rgba(37,99,235,0.5)]" />
                {i < chartData.filter(d => d.milestone).length - 1 && (
                  <div className="w-px h-6 bg-medical-blue-500/20 mt-1" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{d.milestone.label}</span>
                  <span className="text-[9px] text-slate-600">{d.date}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{d.milestone.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
