import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Download,
  Copy,
  Check,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';

interface DataVisualizerProps {
  data: Record<string, any>[];
  columns: string[];
  fileName?: string;
}

const COLOR_PALETTE = [
  '#38bdf8', // cyan-400
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
];

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data, columns, fileName }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [copied, setCopied] = useState(false);

  // Auto-detect numeric vs categorical columns
  const { numericCols, categoricalCols } = useMemo(() => {
    if (!data || data.length === 0) return { numericCols: [], categoricalCols: [] };

    const numCols: string[] = [];
    const catCols: string[] = [];

    columns.forEach((col) => {
      const sampleVal = data.find((row) => row[col] !== undefined && row[col] !== null && row[col] !== '')?.[col];
      const parsedNum = Number(sampleVal);
      if (!isNaN(parsedNum) && typeof sampleVal !== 'boolean') {
        numCols.push(col);
      } else {
        catCols.push(col);
      }
    });

    return {
      numericCols: numCols.length > 0 ? numCols : columns,
      categoricalCols: catCols.length > 0 ? catCols : columns,
    };
  }, [data, columns]);

  const [xAxisKey, setXAxisKey] = useState<string>(() => {
    return categoricalCols[0] || columns[0] || '';
  });

  const [yAxisKey, setYAxisKey] = useState<string>(() => {
    return numericCols[0] || columns[1] || columns[0] || '';
  });

  // Clean formatted numeric data for charts
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.slice(0, 100).map((row, idx) => {
      const xVal = row[xAxisKey] ?? `Row ${idx + 1}`;
      const rawY = row[yAxisKey];
      const numY = Number(rawY);
      return {
        ...row,
        [xAxisKey]: String(xVal).length > 20 ? String(xVal).slice(0, 20) + '...' : String(xVal),
        [yAxisKey]: isNaN(numY) ? 0 : numY,
      };
    });
  }, [data, xAxisKey, yAxisKey]);

  // Compute metric stats
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0 || !yAxisKey) return null;
    const values = chartData.map((d) => Number(d[yAxisKey]) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: data.length,
      sum: sum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      avg: avg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      min: min.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      max: max.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    };
  }, [chartData, data, yAxisKey]);

  const handleCopyData = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!data || data.length === 0) return;
    const headerRow = columns.join(',');
    const bodyRows = data.map((row) =>
      columns.map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headerRow, ...bodyRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(fileName || 'data').replace(/\.[^/.]+$/, '')}_analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
        <TableIcon className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No structured rows found to visualize</p>
        <p className="text-xs text-slate-500">Upload a CSV, Excel, or JSON document with headers and numerical metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visualizer Toolbar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'bar' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'line' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'area' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Area
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'pie' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Pie
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyData}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" /> Export Clean CSV
            </button>
          </div>
        </div>

        {/* Axis Column Mapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              X-Axis / Category Column
            </label>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Y-Axis / Metric Column
            </label>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
            >
              {numericCols.map((col) => (
                <option key={col} value={col}>
                  {col} (Numeric)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total Rows</span>
            <span className="text-lg font-black text-white">{stats.count}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Sum ({yAxisKey})</span>
            <span className="text-lg font-black text-cyan-400">{stats.sum}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Average</span>
            <span className="text-lg font-black text-indigo-400">{stats.avg}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Minimum</span>
            <span className="text-lg font-black text-rose-400">{stats.min}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Maximum</span>
            <span className="text-lg font-black text-emerald-400">{stats.max}</span>
          </div>
        </div>
      )}

      {/* Main Interactive Recharts Stage */}
      <div className="p-6 bg-slate-950/80 border border-white/10 rounded-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {chartType.toUpperCase()} Chart: <span className="text-cyan-400">{yAxisKey}</span> vs{' '}
              <span className="text-indigo-400">{xAxisKey}</span>
            </span>
          </h4>
          <span className="text-[11px] text-slate-400">Showing top {chartData.length} records</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey={yAxisKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey={yAxisKey} stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey={yAxisKey} stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData.slice(0, 10)}
                  dataKey={yAxisKey}
                  nameKey={xAxisKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
