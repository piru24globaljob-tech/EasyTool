import React, { useState, useRef } from 'react';
import {
  FileText,
  FileEdit,
  Scissors,
  Minimize2,
  FileImage,
  Image,
  RotateCw,
  Trash2,
  FileOutput,
  ArrowUp,
  Stamp,
  Lock,
  PenTool,
  ShieldOff,
  FileArchive,
  RefreshCw,
  Scaling,
  Crop,
  UserCheck,
  Sparkles,
  EyeOff,
  AlignLeft,
  Type,
  ListFilter,
  QrCode,
  FileCode,
  MessageSquareText,
  BrainCircuit,
  Key,
  Table,
  Globe,
  ScanText,
  FileCheck,
  Sparkle,
  HelpCircle,
  ShieldCheck,
  FileX,
  Share2,
  Presentation,
  BarChart3,
  Filter,
  LayoutDashboard,
  Star,
  Search,
  Zap,
  Check,
  Eraser,
  X,
} from 'lucide-react';
import { FileTool, ToolCategory } from '../types';
import { FILE_TOOLS } from '../data/tools';

interface ToolGridProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectTool: (toolId: string) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileEdit: FileEdit,
  FilePlus: FileText,
  Scissors: Scissors,
  Minimize2: Minimize2,
  FileImage: FileImage,
  Image: Image,
  RotateCw: RotateCw,
  Trash2: Trash2,
  FileOutput: FileOutput,
  ArrowUpUp: ArrowUp,
  Stamp: Stamp,
  Lock: Lock,
  PenTool: PenTool,
  ShieldOff: ShieldOff,
  FileArchive: FileArchive,
  RefreshCw: RefreshCw,
  Scaling: Scaling,
  Crop: Crop,
  UserCheck: UserCheck,
  Sparkles: Sparkles,
  EyeOff: EyeOff,
  AlignLeft: AlignLeft,
  Type: Type,
  ListFilter: ListFilter,
  QrCode: QrCode,
  FileCode: FileCode,
  MessageSquareText: MessageSquareText,
  BrainCircuit: BrainCircuit,
  Key: Key,
  Table: Table,
  Globe: Globe,
  ScanText: ScanText,
  FileCheck: FileCheck,
  Sparkle: Sparkle,
  HelpCircle: HelpCircle,
  ShieldCheck: ShieldCheck,
  FileX: FileX,
  Share2: Share2,
  Presentation: Presentation,
  BarChart3: BarChart3,
  Filter: Filter,
  LayoutDashboard: LayoutDashboard,
  FileText: FileText,
  Eraser: Eraser,
};

const POPULAR_SEARCH_PRESETS = [
  { label: '⚡ Remove Watermark', query: 'watermark' },
  { label: '📄 Merge PDF', query: 'merge' },
  { label: '🗜️ Compress PDF', query: 'compress' },
  { label: '🤖 AI Chat', query: 'ai' },
  { label: '✍️ Sign PDF', query: 'sign' },
  { label: '🔄 Convert to Word', query: 'word' },
  { label: '📊 Excel Dashboard', query: 'excel' },
  { label: '🔐 Protect / Lock', query: 'lock' },
];

export const ToolGrid: React.FC<ToolGridProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'favorites'>('all');
  const [localInput, setLocalInput] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync incoming search query prop
  React.useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(localInput.trim());
  };

  const handleClearSearch = () => {
    setLocalInput('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handlePresetClick = (query: string) => {
    setLocalInput(query);
    setSearchQuery(query);
    setActiveCategory('all');
  };

  const categories: Array<{ id: ToolCategory | 'all' | 'favorites'; label: string; icon?: string }> = [
    { id: 'all', label: 'All Tools' },
    { id: 'pdf', label: '📄 PDF Tools' },
    { id: 'image', label: '🖼️ Image Tools' },
    { id: 'document', label: '📝 Document Tools' },
    { id: 'ai', label: '🤖 AI Tools' },
    { id: 'privacy', label: '🔐 Privacy Tools' },
    { id: 'favorites', label: '⭐ Favorites' },
  ];

  const filteredTools = FILE_TOOLS.filter((tool) => {
    if (activeCategory === 'favorites') {
      if (!favorites.includes(tool.id)) return false;
    } else if (activeCategory !== 'all') {
      if (tool.category !== activeCategory) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchDesc || matchKeywords;
    }

    return true;
  });

  return (
    <section id="tool-catalog" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Prominent Tool Search Bar with Dedicated Search Button */}
      <div className="mb-6 bg-white/90 backdrop-blur-md border border-blue-150 rounded-2xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={localInput}
              onChange={(e) => {
                setLocalInput(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search tools by name, action, or format (e.g. Remove Watermark, Merge PDF, OCR, Sign)..."
              className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition-all shadow-inner"
            />
            {localInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dedicated Search Action Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Tools</span>
          </button>
        </form>

        {/* Popular Search Suggestions / Quick Action Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Popular:
          </span>
          {POPULAR_SEARCH_PRESETS.map((preset) => (
            <button
              key={preset.query}
              type="button"
              onClick={() => handlePresetClick(preset.query)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                searchQuery.toLowerCase() === preset.query.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2 overflow-x-auto border-b border-blue-100">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                  : 'bg-white hover:bg-blue-50/80 text-slate-700 border border-blue-150 shadow-2xs'
              }`}
            >
              {cat.label}
              {cat.id === 'favorites' && favorites.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium shrink-0">
          Showing <strong className="text-blue-600">{filteredTools.length}</strong> tool(s)
          {searchQuery && <span> for &ldquo;<span className="font-semibold text-slate-800">{searchQuery}</span>&rdquo;</span>}
        </span>
      </div>

      {/* Grid of Tools */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16 bg-white border border-blue-100 backdrop-blur-md rounded-2xl shadow-xs">
          <Search className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No tools found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
            No tools matched &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for merge, compress, watermark, or convert.
          </p>
          <button
            onClick={() => {
              setLocalInput('');
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold rounded-xl hover:opacity-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Reset Filters & Show All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const IconComponent = ICON_MAP[tool.icon] || FileText;
            const isFav = favorites.includes(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="group relative bg-white border border-blue-100 hover:border-blue-500/50 rounded-2xl p-4 hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-md transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:-translate-y-0.5"
              >
                {/* Favorite Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className={`absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-all ${
                    isFav
                      ? 'text-amber-500 bg-amber-50 border border-amber-200'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50 opacity-0 group-hover:opacity-100'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                </button>

                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                        tool.category === 'ai'
                          ? 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white'
                          : tool.category === 'pdf'
                          ? 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white'
                          : tool.category === 'image'
                          ? 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white'
                          : tool.category === 'privacy'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white'
                          : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {tool.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          tool.badge === 'AI'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : tool.badge === 'Popular'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  {/* Tool Title */}
                  <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors font-display">
                    {tool.name}
                  </h3>

                  {/* Tool Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                </div>

                {/* Formats Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px] text-slate-500 font-medium">
                    {tool.supportedFormats.join(', ')}
                  </span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
