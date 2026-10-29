import React, { useState } from 'react';
import { formatNumber } from '../utils/formatters';
import { TrendingUp, Sparkles, Calendar, Zap, ArrowUpRight, BarChart2, LineChart } from 'lucide-react';

export const AnalyticsChart = ({ 
  data = [], 
  range = '30d', 
  metricType = 'followers', // 'followers' | 'views' | 'engagement'
  showForecast = false 
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartMode, setChartMode] = useState('spline'); // 'spline' | 'bars'

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-mono space-y-2">
        <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
        <span>No historical snapshot data points available for range '{range}'.</span>
      </div>
    );
  }

  // Extract numeric values according to metricType
  const getVal = (point) => {
    if (metricType === 'views') return Number(point.views ?? point.value ?? 0);
    if (metricType === 'stars') return Number(point.stars ?? point.value ?? 0);
    if (metricType === 'engagement') return Number(point.engagement ?? point.value ?? 0);
    return Number(point.followers ?? point.value ?? 0);
  };

  const rawValues = data.map(getVal);
  const maxVal = Math.max(...rawValues, 0);
  const minVal = Math.max(0, Math.min(...rawValues));
  const valRange = Math.max(maxVal - minVal, 1);

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const drawWidth = svgWidth - paddingX * 2;
  const drawHeight = svgHeight - paddingY * 2;

  // Calculate coordinates for historical points
  const points = data.map((d, idx) => {
    const val = getVal(d);
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * drawWidth;
    const y = svgHeight - paddingY - ((val - minVal) / valRange) * drawHeight;
    const dateLabel = d.date || (d.timestamp ? new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${idx + 1}`);
    return { ...d, val, x, y, dateLabel };
  });

  // Generate smooth cubic bezier SVG path
  const generateBezierPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = generateBezierPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  // Predictive Forecast points (Next 3 steps into future)
  let forecastPath = '';
  let forecastPoints = [];
  if (showForecast && points.length > 1) {
    const lastPoint = points[points.length - 1];
    const prevPoint = points[points.length - 2];
    const trendSlope = (lastPoint.val - prevPoint.val);
    const stepX = (drawWidth / Math.max(data.length - 1, 1)) * 0.7;

    const f1 = {
      x: Math.min(svgWidth - 10, lastPoint.x + stepX),
      y: Math.max(paddingY, lastPoint.y - ((trendSlope * 0.9) / valRange) * drawHeight),
      val: Math.round(lastPoint.val + trendSlope * 0.9),
      dateLabel: '+10 Days (Proj)'
    };
    const f2 = {
      x: Math.min(svgWidth - 5, lastPoint.x + stepX * 2),
      y: Math.max(paddingY, f1.y - ((trendSlope * 0.8) / valRange) * drawHeight),
      val: Math.round(f1.val + trendSlope * 0.8),
      dateLabel: '+20 Days (Proj)'
    };
    const f3 = {
      x: Math.min(svgWidth - 2, lastPoint.x + stepX * 3),
      y: Math.max(paddingY, f2.y - ((trendSlope * 0.75) / valRange) * drawHeight),
      val: Math.round(f2.val + trendSlope * 0.75),
      dateLabel: '+30 Days (Proj)'
    };

    forecastPoints = [lastPoint, f1, f2, f3];
    forecastPath = `M ${lastPoint.x} ${lastPoint.y} L ${f1.x} ${f1.y} L ${f2.x} ${f2.y} L ${f3.x} ${f3.y}`;
  }

  // Grid line levels (4 horizontal reference ticks)
  const gridTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minVal + pct * valRange;
    const y = svgHeight - paddingY - pct * drawHeight;
    return { val, y };
  });

  return (
    <div className="space-y-4 select-none">
      {/* Chart Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setChartMode('spline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartMode === 'spline'
                  ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Spline Wave</span>
            </button>
            <button
              onClick={() => setChartMode('bars')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartMode === 'bars'
                  ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-sm'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Velocity Bars</span>
            </button>
          </div>

          {showForecast && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold animate-pulse">
              <Sparkles className="w-3 h-3" /> AI Predictive Trajectory Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-brand-indigo to-brand-pink inline-block"></span>
            <span>Historical Curve</span>
          </span>
          {showForecast && (
            <span className="flex items-center gap-1.5 text-pink-400">
              <span className="w-3 h-0.5 border-t border-dashed border-pink-400 inline-block"></span>
              <span>Predicted Forecast</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950/60 to-slate-900/60 border border-slate-800 p-2 sm:p-4">
        
        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-slate-900/95 border border-brand-purple/40 shadow-2xl backdrop-blur-md text-xs font-mono animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(Math.max(10, (hoveredPoint.x / svgWidth) * 100), 82)}%`,
              top: `${Math.max(10, hoveredPoint.y - 65)}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Calendar className="w-3 h-3 text-brand-purple" />
              <span>{hoveredPoint.dateLabel}</span>
            </div>
            <div className="text-sm font-extrabold text-white pt-1 font-mono">
              {formatNumber(hoveredPoint.val)} {metricType === 'engagement' ? '%' : ''}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>High Trajectory Velocity</span>
            </div>
          </div>
        )}

        {/* Mode 1: Interactive Smooth SVG Spline Area Chart */}
        {chartMode === 'spline' ? (
          <div className="w-full">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-56 sm:h-64 overflow-visible"
            >
              <defs>
                {/* Neon Area Fill Gradient */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.00" />
                </linearGradient>

                {/* Stroke Line Gradient */}
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              {gridTicks.map((tick, i) => (
                <g key={i}>
                  <line 
                    x1={paddingX} 
                    y1={tick.y} 
                    x2={svgWidth - paddingX} 
                    y2={tick.y} 
                    stroke="currentColor" 
                    strokeDasharray="4 4" 
                    className="text-slate-800/80" 
                    strokeWidth="1"
                  />
                  <text 
                    x={paddingX - 8} 
                    y={tick.y + 3} 
                    textAnchor="end" 
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {formatNumber(Math.round(tick.val))}
                  </text>
                </g>
              ))}

              {/* Gradient Area Fill */}
              {areaPath && (
                <path d={areaPath} fill="url(#areaGradient)" />
              )}

              {/* Main Glowing Bezier Trendline */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#strokeGradient)" 
                  strokeWidth="3.5" 
                  filter="url(#glow)"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Predictive Forecast Line (Dashed Glowing Pink) */}
              {showForecast && forecastPath && (
                <path 
                  d={forecastPath} 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 6" 
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              )}

              {/* Data Interactive Nodes */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.x === pt.x ? '6.5' : '4'}
                    className="fill-slate-900 stroke-purple-400 transition-all duration-200"
                    strokeWidth="2.5"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* Forecast Nodes */}
              {showForecast && forecastPoints.slice(1).map((fPt, idx) => (
                <g key={`f-${idx}`}>
                  <circle
                    cx={fPt.x}
                    cy={fPt.y}
                    r="4.5"
                    className="fill-slate-900 stroke-pink-400 animate-pulse"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(fPt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((pt, idx) => (
                (idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                  <text
                    key={`label-${idx}`}
                    x={pt.x}
                    y={svgHeight - 6}
                    textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                    className="fill-slate-400 text-[10px] font-mono font-semibold"
                  >
                    {pt.dateLabel}
                  </text>
                )
              ))}
            </svg>
          </div>
        ) : (
          /* Mode 2: Dynamic Velocity Bar Chart */
          <div className="h-56 sm:h-64 flex items-end gap-2 pt-8 pb-3 px-3">
            {points.map((pt, idx) => {
              const heightPercent = Math.min(100, Math.max(12, ((pt.val - minVal) / valRange) * 100));
              const isHovered = hoveredPoint?.x === pt.x;

              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-gradient-to-t from-brand-indigo via-brand-purple to-pink-400 brightness-125 shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-t from-brand-indigo/80 via-brand-purple/80 to-brand-pink/80 group-hover:brightness-110'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-full">
                    {pt.dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Metric Footer Stat Row */}
      {(() => {
        const startVal = points.length > 0 ? points[0].val : 0;
        const currentVal = points.length > 0 ? points[points.length - 1].val : 0;
        const delta = currentVal - startVal;
        const deltaSign = delta > 0 ? '+' : '';
        const statusLabel = delta > 0 ? 'Trending Up' : (currentVal > 0 ? 'Consistent' : 'Baseline Active');

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Peak Milestone</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{formatNumber(maxVal)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Range Baseline</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{formatNumber(minVal)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Net Trajectory Delta</span>
              <span className={`text-sm font-bold font-mono ${delta >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500'}`}>
                {deltaSign}{formatNumber(delta)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Trajectory Status</span>
              <span className="text-sm font-bold font-mono text-[#6D5EF7] dark:text-[#8B7FF9] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> {statusLabel}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AnalyticsChart;
