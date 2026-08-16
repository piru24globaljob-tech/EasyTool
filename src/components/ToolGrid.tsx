import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Check,
  Eraser,
  FolderOpen,
  Zap,
} from 'lucide-react';
import { FileTool, ToolCategory } from '../types';
import { FILE_TOOLS } from '../data/tools';

interface ToolGridProps {
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

export const ToolGrid: React.FC<ToolGridProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'favorites'>('all');

  const categories: Array<{ id: ToolCategory | 'all' | 'favorites'; label: string }> = [
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
      return favorites.includes(tool.id);
    }
    if (activeCategory !== 'all') {
      return tool.category === activeCategory;
    }
    return true;
  });

  return (
    <section id="tool-catalog" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 perspective-1000">
      {/* 4K Category Navigation Tabs with Smooth Animated Pill */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-3 overflow-x-auto border-b border-blue-100/80">
        <div className="flex items-center gap-2 relative">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'btn-3d-blue text-white shadow-lg shadow-blue-500/35 !scale-105'
                    : 'btn-3d-white text-slate-700 hover:text-blue-600'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {cat.label}
                  {cat.id === 'favorites' && favorites.length > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full font-black text-[10px] ${
                        isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {favorites.length}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-600 font-bold bg-white/90 px-3.5 py-1.5 rounded-xl border border-blue-100 shadow-[0_2px_6px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span><strong className="text-blue-600 font-black">{filteredTools.length}</strong> 4K Tools</span>
          </span>
        </div>
      </div>

      {/* 4K Animated Grid of Tools */}
      <AnimatePresence mode="popLayout">
        {filteredTools.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-center py-16 bg-white/90 border border-blue-150 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_-12px_rgba(59,130,246,0.15)]"
          >
            <FolderOpen className="w-14 h-14 text-blue-400 mx-auto mb-3 animate-float-3d" />
            <h3 className="text-lg font-extrabold text-slate-900 mb-1 font-display">No tools in this section</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              {activeCategory === 'favorites'
                ? 'You have not added any tools to your favorites yet. Click the star icon on any 4K tool card to favorite it.'
                : 'No tools available in this category.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="btn-3d-blue px-6 py-3 text-white text-xs font-black rounded-xl cursor-pointer uppercase tracking-wider"
            >
              Show All Tools
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filteredTools.map((tool, index) => {
              const IconComponent = ICON_MAP[tool.icon] || FileText;
              const isFav = favorites.includes(tool.id);

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.3) }}
                  onClick={() => onSelectTool(tool.id)}
                  className="card-3d glass-specular-3d group relative bg-white/95 rounded-2xl p-5 border border-slate-200/80 border-b-4 border-b-slate-200 hover:border-b-blue-500 hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* 4K Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    className={`absolute top-3.5 right-3.5 p-2 rounded-xl transition-all cursor-pointer z-10 ${
                      isFav
                        ? 'text-amber-500 bg-amber-50 border border-amber-200 shadow-sm'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                  </button>

                  <div>
                    {/* 4K Icon & Badge Header */}
                    <div className="flex items-center gap-3 mb-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border-t border-white shadow-[0_8px_16px_-2px_rgba(0,0,0,0.14)] group-hover:scale-110 group-hover:rotate-6 ${
                          tool.category === 'ai'
                            ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white border-b-2 border-purple-900 shadow-purple-500/20'
                            : tool.category === 'pdf'
                            ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white border-b-2 border-rose-900 shadow-rose-500/20'
                            : tool.category === 'image'
                            ? 'bg-gradient-to-b from-sky-500 to-sky-700 text-white border-b-2 border-sky-900 shadow-sky-500/20'
                            : tool.category === 'privacy'
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-b-2 border-emerald-900 shadow-emerald-500/20'
                            : 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-b-2 border-blue-900 shadow-blue-500/20'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 drop-shadow-sm" />
                      </div>

                      {tool.badge && (
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border shadow-xs tracking-wider uppercase ${
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
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 group-hover:text-blue-600 transition-colors font-display tracking-tight">
                      {tool.name}
                    </h3>

                    {/* Tool Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  {/* 4K Formats Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[140px] text-slate-500 font-medium">
                      {tool.supportedFormats.join(', ')}
                    </span>
                    <span className="font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Launch 4K →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
