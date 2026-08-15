import React, { useState } from 'react';
import {
  Filter,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Calendar,
  User,
  Building,
  MapPin,
  FileText,
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  Loader2,
  Code2,
} from 'lucide-react';
import { extractDataFields } from '../lib/aiApi';
import * as XLSX from 'xlsx';

interface DataExtractorViewProps {
  documentText?: string;
  fileName?: string;
}

export const DataExtractorView: React.FC<DataExtractorViewProps> = ({ documentText = '', fileName = 'document' }) => {
  const [inputText, setInputText] = useState<string>(documentText);
  const [customRegex, setCustomRegex] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleRunExtract = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await extractDataFields(inputText, customRegex.trim() || undefined);
      setExtractedResult(res);
    } catch (err) {
      console.error('Data Extraction Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadExcel = () => {
    if (!extractedResult) return;
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Entity Type', 'Extracted Count', 'Values'],
      ['Emails', extractedResult.emails?.length || 0, (extractedResult.emails || []).join('; ')],
      ['Phones', extractedResult.phones?.length || 0, (extractedResult.phones || []).join('; ')],
      ['URLs', extractedResult.urls?.length || 0, (extractedResult.urls || []).join('; ')],
      ['Monetary Amounts', extractedResult.amounts?.length || 0, (extractedResult.amounts || []).join('; ')],
      ['Dates', extractedResult.dates?.length || 0, (extractedResult.dates || []).join('; ')],
      ['People Names', extractedResult.people?.length || 0, (extractedResult.people || []).join('; ')],
      ['Organizations', extractedResult.organizations?.length || 0, (extractedResult.organizations || []).join('; ')],
      ['Addresses', extractedResult.addresses?.length || 0, (extractedResult.addresses || []).join('; ')],
    ];

    if (extractedResult.customMatches?.length > 0) {
      summaryData.push(['Custom Regex Matches', extractedResult.customMatches.length, extractedResult.customMatches.join('; ')]);
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Extraction Summary');

    // Key Value Pairs Sheet
    if (extractedResult.keyValuePairs && extractedResult.keyValuePairs.length > 0) {
      const kvRows = extractedResult.keyValuePairs.map((kv: any) => [kv.key || '', kv.value || '']);
      const wsKV = XLSX.utils.aoa_to_sheet([['Attribute / Field', 'Value'], ...kvRows]);
      XLSX.utils.book_append_sheet(wb, wsKV, 'Extracted Attributes');
    }

    const cleanName = fileName.replace(/\.[^/.]+$/, '');
    XLSX.writeFile(wb, `${cleanName}_Extracted_Entities.xlsx`);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Control Box */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" /> Smart Data & Entity Extractor
          </label>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
            Regex + AI Powered
          </span>
        </div>

        {/* Text Input Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Document Text Source</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw text or invoice content to extract emails, phones, numbers, dates, addresses, and AI attributes..."
            className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
          />
        </div>

        {/* Custom Regex Pattern Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Custom Regex Pattern (Optional)
          </label>
          <input
            type="text"
            value={customRegex}
            onChange={(e) => setCustomRegex(e.target.value)}
            placeholder="e.g. \b[A-Z]{2,3}-\d{4,6}\b or INV-\d+"
            className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
          />
        </div>

        <button
          onClick={handleRunExtract}
          disabled={loading || !inputText.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-90 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Extracting Structured Data...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Extract All Entities
            </>
          )}
        </button>
      </div>

      {/* Extraction Results */}
      {extractedResult && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/10 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Extracted Document Intelligence
              </h3>
              <p className="text-xs text-slate-400">
                Found {extractedResult.emails?.length || 0} Emails • {extractedResult.phones?.length || 0} Phones • {extractedResult.amounts?.length || 0} Monetary Figures
              </p>
            </div>

            <button
              onClick={downloadExcel}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel Spreadsheet (.xlsx)
            </button>
          </div>

          {/* Invoice Metadata Banner if detected */}
          {extractedResult.invoiceMetadata && (extractedResult.invoiceMetadata.invoiceNumber || extractedResult.invoiceMetadata.totalAmount) && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-[10px] text-indigo-300 font-bold uppercase">Invoice Number</span>
                <span className="text-xs font-black text-white">{extractedResult.invoiceMetadata.invoiceNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-300 font-bold uppercase">Vendor / Company</span>
                <span className="text-xs font-black text-white">{extractedResult.invoiceMetadata.vendorName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-300 font-bold uppercase">Total Amount</span>
                <span className="text-xs font-black text-cyan-300">{extractedResult.invoiceMetadata.totalAmount || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-indigo-300 font-bold uppercase">Invoice Date</span>
                <span className="text-xs font-black text-white">{extractedResult.invoiceMetadata.invoiceDate || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emails */}
            <ExtractionCategoryCard
              title="Emails Extracted"
              icon={<Mail className="w-4 h-4 text-cyan-400" />}
              items={extractedResult.emails}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="email"
            />

            {/* Phones */}
            <ExtractionCategoryCard
              title="Phone Numbers"
              icon={<Phone className="w-4 h-4 text-indigo-400" />}
              items={extractedResult.phones}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="phone"
            />

            {/* URLs */}
            <ExtractionCategoryCard
              title="Web URLs & Domains"
              icon={<Globe className="w-4 h-4 text-emerald-400" />}
              items={extractedResult.urls}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="url"
            />

            {/* Amounts */}
            <ExtractionCategoryCard
              title="Monetary Amounts"
              icon={<DollarSign className="w-4 h-4 text-amber-400" />}
              items={extractedResult.amounts}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="amount"
            />

            {/* Dates */}
            <ExtractionCategoryCard
              title="Dates & Timestamps"
              icon={<Calendar className="w-4 h-4 text-rose-400" />}
              items={extractedResult.dates}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="date"
            />

            {/* People */}
            <ExtractionCategoryCard
              title="People & Persons (AI)"
              icon={<User className="w-4 h-4 text-cyan-300" />}
              items={extractedResult.people}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="person"
            />

            {/* Organizations */}
            <ExtractionCategoryCard
              title="Organizations & Brands"
              icon={<Building className="w-4 h-4 text-purple-400" />}
              items={extractedResult.organizations}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="org"
            />

            {/* Addresses */}
            <ExtractionCategoryCard
              title="Postal Addresses"
              icon={<MapPin className="w-4 h-4 text-pink-400" />}
              items={extractedResult.addresses}
              onCopy={(val, id) => copyToClipboard(val, id)}
              copiedId={copiedId}
              idPrefix="address"
            />

            {/* Custom Matches if requested */}
            {extractedResult.customMatches && extractedResult.customMatches.length > 0 && (
              <ExtractionCategoryCard
                title="Custom Regex Matches"
                icon={<Code2 className="w-4 h-4 text-cyan-400" />}
                items={extractedResult.customMatches}
                onCopy={(val, id) => copyToClipboard(val, id)}
                copiedId={copiedId}
                idPrefix="custom"
              />
            )}
          </div>

          {/* Key Value Pairs Table */}
          {extractedResult.keyValuePairs && extractedResult.keyValuePairs.length > 0 && (
            <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Key-Value Document Attributes
              </h4>
              <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Attribute Name</th>
                      <th className="p-2.5">Extracted Value</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {extractedResult.keyValuePairs.map((kv: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2.5 font-bold text-cyan-300">{kv.key}</td>
                        <td className="p-2.5 text-slate-200">{kv.value}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => copyToClipboard(`${kv.key}: ${kv.value}`, `kv-${idx}`)}
                            className="p-1 bg-white/5 hover:bg-white/10 rounded transition-all"
                          >
                            {copiedId === `kv-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  items?: string[];
  onCopy: (val: string, id: string) => void;
  copiedId: string | null;
  idPrefix: string;
}

const ExtractionCategoryCard: React.FC<CategoryCardProps> = ({ title, icon, items = [], onCopy, copiedId, idPrefix }) => {
  return (
    <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl space-y-2">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          {icon} {title}
        </h4>
        <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-slate-400">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic p-2">None detected</p>
      ) : (
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {items.map((item, idx) => {
            const itemId = `${idPrefix}-${idx}`;
            return (
              <div key={idx} className="p-2 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <span className="truncate font-mono text-slate-300 text-[11px]">{item}</span>
                <button
                  onClick={() => onCopy(item, itemId)}
                  className="p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-all shrink-0 ml-2"
                >
                  {copiedId === itemId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
