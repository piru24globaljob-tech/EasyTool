import React, { useState } from 'react';
import {
  Globe,
  Code,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  Search,
  Image as ImageIcon,
  Heading,
  ListFilter,
  Loader2,
  Table as TableIcon,
} from 'lucide-react';
import { scrapeWebpage } from '../lib/aiApi';

interface DataScraperViewProps {
  onExportData?: (data: any, fileName: string) => void;
}

export const DataScraperView: React.FC<DataScraperViewProps> = () => {
  const [mode, setMode] = useState<'url' | 'html'>('url');
  const [urlInput, setUrlInput] = useState<string>('');
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'images' | 'headings'>('overview');
  const [scrapedData, setScrapedData] = useState<any | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleScrape = async () => {
    setError(null);
    if (mode === 'url' && !urlInput.trim()) {
      setError('Please enter a website URL to scrape.');
      return;
    }
    if (mode === 'html' && !htmlInput.trim()) {
      setError('Please paste HTML source code to scrape.');
      return;
    }

    setLoading(true);
    try {
      const result = await scrapeWebpage({
        url: mode === 'url' ? urlInput.trim() : undefined,
        htmlContent: mode === 'html' ? htmlInput : undefined,
        targetPrompt: promptInput.trim() || undefined,
      });
      setScrapedData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to scrape webpage.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadJson = () => {
    if (!scrapedData) return;
    const blob = new Blob([JSON.stringify(scrapedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped_${(scrapedData.title || 'webpage').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLinks = (scrapedData?.links || []).filter(
    (l: any) =>
      l.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-200">
      {/* Input Stage */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" /> Web Scraper Configuration
          </label>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('url')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              URL Link
            </button>
            <button
              onClick={() => setMode('html')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mode === 'html' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML Source Code
            </button>
          </div>
        </div>

        {mode === 'url' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Webpage URL</label>
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com or news website URL..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
              />
              <Globe className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Paste Raw HTML Code</label>
            <textarea
              rows={4}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="<html><body><h1>Title</h1><a href='...'>Link</a></body></html>"
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-cyan-400"
            />
          </div>
        )}

        {/* Optional AI Extraction Target Prompt */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Optional AI Target Extraction Instruction</span>
            <span className="text-[10px] text-cyan-400 font-normal">AI Powered</span>
          </label>
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g., Extract product titles, prices, ratings, and customer reviews..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleScrape}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-90 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Scrape Webpage Data...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" /> Start Web Scraper
            </>
          )}
        </button>
      </div>

      {/* Scraped Results Stage */}
      {scrapedData && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/10 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" /> {scrapedData.title || 'Scraped Document'}
              </h3>
              <p className="text-xs text-slate-400">
                Found {scrapedData.links?.length || 0} Links • {scrapedData.images?.length || 0} Images • {scrapedData.headings?.length || 0} Headings
              </p>
            </div>

            <button
              onClick={downloadJson}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Export JSON
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              AI Overview
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'links' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Extracted Links ({scrapedData.links?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'images' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Images ({scrapedData.images?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('headings')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'headings' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Headings ({scrapedData.headings?.length || 0})
            </button>
          </div>

          {/* Tab 1: AI Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {scrapedData.aiExtracted && (
                <div className="p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Extracted Intelligence
                  </h4>
                  {scrapedData.aiExtracted.summary && (
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-white/5">
                      {scrapedData.aiExtracted.summary}
                    </p>
                  )}

                  {scrapedData.aiExtracted.mainTopics && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scrapedData.aiExtracted.mainTopics.map((topic: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-semibold">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {scrapedData.aiExtracted.extractedItems && scrapedData.aiExtracted.extractedItems.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Structured Key Items:</span>
                      <ul className="space-y-1">
                        {scrapedData.aiExtracted.extractedItems.map((item: any, idx: number) => (
                          <li key={idx} className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                            <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Meta Tags */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Page Meta Tags ({scrapedData.metaTags?.length || 0})</h4>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {(scrapedData.metaTags || []).map((m: any, idx: number) => (
                    <div key={idx} className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-white/5 flex justify-between gap-2">
                      <span className="font-mono text-cyan-400 shrink-0">{m.name}:</span>
                      <span className="truncate text-slate-300">{m.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Text Snippet */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Raw Clean Text Preview</h4>
                <p className="text-xs text-slate-400 font-mono leading-relaxed max-h-40 overflow-y-auto p-3 bg-slate-900 rounded-xl">
                  {scrapedData.bodyTextSnippet || 'No body text extracted'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Links */}
          {activeTab === 'links' && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search extracted links..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {filteredLinks.map((link: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate flex-1">
                      <p className="font-semibold text-white truncate">{link.text || 'Untitled Link'}</p>
                      <p className="font-mono text-[11px] text-cyan-400 truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyToClipboard(link.url, `link-${idx}`)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all"
                      >
                        {copiedIndex === `link-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {activeTab === 'images' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
              {(scrapedData.images || []).map((img: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950 border border-white/10 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.alt || 'scraped'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <ImageIcon className="w-5 h-5 text-slate-600 absolute" />
                  </div>
                  <div className="truncate flex-1 text-xs">
                    <p className="font-semibold text-white truncate">{img.alt || 'Image'}</p>
                    <p className="font-mono text-[10px] text-slate-400 truncate">{img.src}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(img.src, `img-${idx}`)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg shrink-0"
                  >
                    {copiedIndex === `img-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Headings */}
          {activeTab === 'headings' && (
            <div className="max-h-96 overflow-y-auto space-y-2 p-1">
              {(scrapedData.headings || []).map((h: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-mono font-bold text-[10px]">
                    {h.tag.toUpperCase()}
                  </span>
                  <span className="text-slate-200 font-medium">{h.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
