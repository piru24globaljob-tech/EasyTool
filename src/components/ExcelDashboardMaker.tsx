import React, { useState, useMemo, useEffect } from 'react';
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
  LayoutDashboard,
  Table as TableIcon,
  Download,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  Filter,
  FileSpreadsheet,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  RefreshCw,
  Loader2,
  Award,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { askAIChat } from '../lib/aiApi';

interface ExcelDashboardMakerProps {
  initialFile?: File;
  fileName?: string;
}

const PALETTE = ['#38bdf8', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

const SAMPLE_EXCEL_SHEETS: Record<string, any[]> = {
  'Regional Sales': [
    { Region: 'North America', Category: 'Electronics', Month: 'Jan 2026', Sales: 45200, Units: 310, Profit: 12400 },
    { Region: 'North America', Category: 'Apparel', Month: 'Jan 2026', Sales: 28400, Units: 540, Profit: 8500 },
    { Region: 'Europe', Category: 'Electronics', Month: 'Jan 2026', Sales: 38900, Units: 280, Profit: 11100 },
    { Region: 'Europe', Category: 'Apparel', Month: 'Jan 2026', Sales: 19500, Units: 420, Profit: 5200 },
    { Region: 'Asia Pacific', Category: 'Electronics', Month: 'Jan 2026', Sales: 52100, Units: 490, Profit: 16800 },
    { Region: 'Asia Pacific', Category: 'Home Decor', Month: 'Feb 2026', Sales: 31000, Units: 360, Profit: 9300 },
    { Region: 'Latin America', Category: 'Electronics', Month: 'Feb 2026', Sales: 22400, Units: 210, Profit: 6200 },
    { Region: 'North America', Category: 'Home Decor', Month: 'Feb 2026', Sales: 34500, Units: 410, Profit: 10200 },
    { Region: 'Europe', Category: 'Home Decor', Month: 'Feb 2026', Sales: 27800, Units: 330, Profit: 7800 },
    { Region: 'Asia Pacific', Category: 'Apparel', Month: 'Feb 2026', Sales: 41200, Units: 620, Profit: 13400 },
  ],
  'Monthly Revenue': [
    { Month: 'Jan', Revenue: 112000, OperatingCosts: 68000, NetProfit: 44000, GrowthPct: 12.5 },
    { Month: 'Feb', Revenue: 128500, OperatingCosts: 71200, NetProfit: 57300, GrowthPct: 14.7 },
    { Month: 'Mar', Revenue: 145000, OperatingCosts: 78000, NetProfit: 67000, GrowthPct: 12.8 },
    { Month: 'Apr', Revenue: 139000, OperatingCosts: 75500, NetProfit: 63500, GrowthPct: -4.1 },
    { Month: 'May', Revenue: 168000, OperatingCosts: 84000, NetProfit: 84000, GrowthPct: 20.8 },
    { Month: 'Jun', Revenue: 192000, OperatingCosts: 91000, NetProfit: 101000, GrowthPct: 14.2 },
  ],
};

export const ExcelDashboardMaker: React.FC<ExcelDashboardMakerProps> = ({ initialFile, fileName }) => {
  const [workbookSheets, setWorkbookSheets] = useState<Record<string, any[]>>(SAMPLE_EXCEL_SHEETS);
  const [activeSheetName, setActiveSheetName] = useState<string>('Regional Sales');
  const [copied, setCopied] = useState<boolean>(false);

  // Aggregation controls
  const [metricCol, setMetricCol] = useState<string>('Sales');
  const [categoryCol, setCategoryCol] = useState<string>('Region');
  const [aggMethod, setAggMethod] = useState<'sum' | 'avg' | 'count' | 'max'>('sum');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Insights State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Handle file import
  useEffect(() => {
    if (initialFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const wb = XLSX.read(buffer, { type: 'array' });
          const sheetsObj: Record<string, any[]> = {};
          wb.SheetNames.forEach((sName) => {
            const raw = XLSX.utils.sheet_to_json(wb.Sheets[sName]);
            if (raw && raw.length > 0) {
              sheetsObj[sName] = raw;
            }
          });
          if (Object.keys(sheetsObj).length > 0) {
            setWorkbookSheets(sheetsObj);
            const firstSheet = Object.keys(sheetsObj)[0];
            setActiveSheetName(firstSheet);
          }
        } catch (err) {
          console.error('Error parsing Excel file:', err);
        }
      };
      reader.readAsArrayBuffer(initialFile);
    }
  }, [initialFile]);

  // Current raw data row array
  const rawData = useMemo(() => {
    return workbookSheets[activeSheetName] || [];
  }, [workbookSheets, activeSheetName]);

  // Extract all columns
  const allColumns = useMemo(() => {
    if (rawData.length === 0) return [];
    return Object.keys(rawData[0]);
  }, [rawData]);

  // Numeric vs Categorical auto-detect
  const { numericCols, categoricalCols } = useMemo(() => {
    const nums: string[] = [];
    const cats: string[] = [];

    allColumns.forEach((col) => {
      const sample = rawData.find((r) => r[col] !== undefined && r[col] !== null && r[col] !== '')?.[col];
      if (!isNaN(Number(sample)) && typeof sample !== 'boolean') {
        nums.push(col);
      } else {
        cats.push(col);
      }
    });

    return {
      numericCols: nums.length > 0 ? nums : allColumns,
      categoricalCols: cats.length > 0 ? cats : allColumns,
    };
  }, [allColumns, rawData]);

  // Reset default selected metric/category when sheet changes
  useEffect(() => {
    if (numericCols.length > 0) {
      setMetricCol(numericCols[0]);
    } else if (allColumns.length > 0) {
      setMetricCol(allColumns[0]);
    }

    if (categoricalCols.length > 0) {
      setCategoryCol(categoricalCols[0]);
    } else if (allColumns.length > 0) {
      setCategoryCol(allColumns[0]);
    }
  }, [activeSheetName, numericCols, categoricalCols, allColumns]);

  // Filtered raw data based on search input
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return rawData;
    const q = searchQuery.toLowerCase();
    return rawData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [rawData, searchQuery]);

  // Compute Pivot Aggregations
  const pivotData = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || !categoryCol || !metricCol) return [];

    const map = new Map<string, { key: string; values: number[]; sum: number; count: number }>();

    filteredData.forEach((row) => {
      const groupKey = String(row[categoryCol] ?? 'Unspecified');
      const val = Number(row[metricCol]);
      const validVal = isNaN(val) ? 0 : val;

      if (!map.has(groupKey)) {
        map.set(groupKey, { key: groupKey, values: [validVal], sum: validVal, count: 1 });
      } else {
        const item = map.get(groupKey)!;
        item.values.push(validVal);
        item.sum += validVal;
        item.count += 1;
      }
    });

    const result = Array.from(map.values()).map((item) => {
      let aggregated = item.sum;
      if (aggMethod === 'avg') aggregated = item.sum / item.count;
      if (aggMethod === 'count') aggregated = item.count;
      if (aggMethod === 'max') aggregated = Math.max(...item.values);

      return {
        category: item.key.length > 22 ? item.key.slice(0, 22) + '...' : item.key,
        fullCategory: item.key,
        metric: Number(aggregated.toFixed(2)),
        count: item.count,
        rawSum: item.sum,
      };
    });

    return result.sort((a, b) => b.metric - a.metric);
  }, [filteredData, categoryCol, metricCol, aggMethod]);

  // Key KPI Scorecard Stats
  const kpis = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const totalRecords = filteredData.length;
    const values = filteredData.map((r) => Number(r[metricCol]) || 0);
    const totalSum = values.reduce((a, b) => a + b, 0);
    const avgVal = totalSum / (totalRecords || 1);
    const maxVal = Math.max(...values);

    // Top Category
    const topCat = pivotData[0]?.fullCategory || 'N/A';
    const topCatVal = pivotData[0]?.metric || 0;

    return {
      totalRecords,
      totalSum: totalSum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      avgVal: avgVal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      maxVal: maxVal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      topCat,
      topCatVal: topCatVal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    };
  }, [filteredData, metricCol, pivotData]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheetsObj: Record<string, any[]> = {};
        wb.SheetNames.forEach((sName) => {
          const raw = XLSX.utils.sheet_to_json(wb.Sheets[sName]);
          if (raw && raw.length > 0) {
            sheetsObj[sName] = raw;
          }
        });
        if (Object.keys(sheetsObj).length > 0) {
          setWorkbookSheets(sheetsObj);
          setActiveSheetName(Object.keys(sheetsObj)[0]);
        }
      } catch (err) {
        console.error('Error reading excel upload:', err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Run AI Dashboard Summary
  const handleGenerateAiInsights = async () => {
    if (!pivotData || pivotData.length === 0) return;
    setAiLoading(true);
    setAiAnalysis(null);

    const sampleSummary = {
      sheetName: activeSheetName,
      metricColumn: metricCol,
      categoryColumn: categoryCol,
      totalRecords: kpis?.totalRecords,
      totalSum: kpis?.totalSum,
      average: kpis?.avgVal,
      topPerformer: kpis?.topCat,
      pivotBreakdown: pivotData.slice(0, 10),
    };

    try {
      const response = await askAIChat(
        `Analyze this Excel spreadsheet dashboard metrics and provide a 3-bullet executive summary with key trends, top growth drivers, and strategic business recommendations:\n\n${JSON.stringify(
          sampleSummary,
          null,
          2
        )}`
      );
      setAiAnalysis(response);
    } catch (err) {
      console.error('AI Insights Error:', err);
      setAiAnalysis('Unable to generate AI analysis at this moment.');
    } finally {
      setAiLoading(false);
    }
  };

  // Export Clean Combined Excel Workbook
  const handleExportDashboardExcel = () => {
    const wb = XLSX.utils.book_new();

    // Pivot Summary Sheet
    const pivotRows = pivotData.map((pd) => ({
      Category: pd.fullCategory,
      [`Metric (${aggMethod.toUpperCase()} of ${metricCol})`]: pd.metric,
      'Row Count': pd.count,
    }));
    const wsPivot = XLSX.utils.json_to_sheet(pivotRows);
    XLSX.utils.book_append_sheet(wb, wsPivot, 'Pivot Dashboard Summary');

    // Raw Sheet
    const wsRaw = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Clean Data Source');

    const downloadName = `${(fileName || activeSheetName).replace(/\.[^/.]+$/, '')}_ExcelDashboard.xlsx`;
    XLSX.writeFile(wb, downloadName);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header & Sheet Tabs */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                Excel Interactive Dashboard Maker
              </h3>
              <p className="text-xs text-slate-400">
                Transform Excel spreadsheets into dynamic multi-chart analytics scorecards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
              <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload Excel (.xlsx)
              <input type="file" accept=".xlsx,.xls,.csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleExportDashboardExcel}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Dashboard (.xlsx)
            </button>
          </div>
        </div>

        {/* Sheet Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Worksheets:
          </span>
          {Object.keys(workbookSheets).map((sheetName) => (
            <button
              key={sheetName}
              onClick={() => setActiveSheetName(sheetName)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSheetName === sheetName
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {sheetName} ({workbookSheets[sheetName]?.length || 0})
            </button>
          ))}
        </div>

        {/* Dashboard Dimension Mapping & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Grouping / Dimension
            </label>
            <select
              value={categoryCol}
              onChange={(e) => setCategoryCol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
            >
              {allColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Metric / Value Field
            </label>
            <select
              value={metricCol}
              onChange={(e) => setMetricCol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
            >
              {numericCols.map((col) => (
                <option key={col} value={col}>
                  {col} (Numeric)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Pivot Aggregation
            </label>
            <select
              value={aggMethod}
              onChange={(e) => setAggMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
            >
              <option value="sum">SUM (Total)</option>
              <option value="avg">AVERAGE (Mean)</option>
              <option value="count">COUNT (Rows)</option>
              <option value="max">MAXIMUM (Peak)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter Records
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spreadsheet..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
              />
              <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Executive Scorecard Cards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total {metricCol}
            </span>
            <span className="text-xl font-black text-white mt-1 block">{kpis.totalSum}</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Aggregated {aggMethod.toUpperCase()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Value</span>
            <span className="text-xl font-black text-indigo-300 mt-1 block">{kpis.avgVal}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Per {categoryCol} Group</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Performer</span>
            <span className="text-sm font-black text-amber-300 mt-1 block truncate">{kpis.topCat}</span>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">{kpis.topCatVal} {metricCol}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rows Filtered</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{kpis.totalRecords}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">From {rawData.length} Total</span>
          </div>
        </div>
      )}

      {/* Main Charts Grid Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bar Breakdown */}
        <div className="p-5 bg-slate-950/80 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" /> {metricCol} Breakdown by {categoryCol}
            </h4>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono">Bar View</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pivotData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="metric" name={metricCol} fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Donut / Pie Share */}
        <div className="p-5 bg-slate-950/80 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" /> Share Distribution ({metricCol})
            </h4>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Donut View</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pivotData.slice(0, 8)}
                  dataKey="metric"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pivotData.slice(0, 8).map((_, idx) => (
                    <Cell key={`c-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Executive Insights Panel */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/20 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> AI Executive Dashboard Brief
          </h4>

          <button
            onClick={handleGenerateAiInsights}
            disabled={aiLoading}
            className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{aiAnalysis ? 'Regenerate Brief' : 'Generate AI Brief'}</span>
          </button>
        </div>

        {aiAnalysis ? (
          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/80 p-4 rounded-xl border border-white/10 whitespace-pre-line">
            {aiAnalysis}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click "Generate AI Brief" to get automated trend detection, top growth drivers, and strategic recommendations directly from your Excel spreadsheet.
          </p>
        )}
      </div>

      {/* Aggregated Pivot Summary Table */}
      <div className="p-5 bg-slate-950/90 border border-white/10 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-emerald-400" /> Pivot Table Aggregation Summary
        </h4>
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="p-3">Category ({categoryCol})</th>
                <th className="p-3">{metricCol} ({aggMethod.toUpperCase()})</th>
                <th className="p-3">Record Count</th>
                <th className="p-3">% Share of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pivotData.map((pd, idx) => {
                const totalMetricSum = pivotData.reduce((acc, curr) => acc + curr.metric, 0) || 1;
                const sharePct = ((pd.metric / totalMetricSum) * 100).toFixed(1);

                return (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{pd.fullCategory}</td>
                    <td className="p-3 font-mono text-cyan-300 font-semibold">{pd.metric.toLocaleString()}</td>
                    <td className="p-3 text-slate-400">{pd.count}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full" style={{ width: `${Math.min(Number(sharePct), 100)}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
