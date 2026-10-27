import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeArticle } from '../../types';
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(knowledgeArticles[0]);

  const categories = Array.from(new Set(knowledgeArticles.map(k => k.category)));

  const filteredArticles = knowledgeArticles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Hospital SOPs & Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {knowledgeArticles.length} approved operational protocols and clinical governance policies
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hospital SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            categoryFilter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All SOP Categories
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === c
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Main Two Column Knowledge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Articles List */}
        <div className="space-y-3">
          {filteredArticles.map(article => {
            const isSelected = selectedArticle?.id === article.id;

            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-400 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>{article.category}</span>
                  <span>{article.id}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {article.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {article.content}
                </p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {article.tags.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Document Reader */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          {selectedArticle ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedArticle.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedArticle.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Reviewed: {selectedArticle.lastUpdated}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified SOP
                </span>
              </div>

              <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedArticle.content}
              </div>

              <div className="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 text-xs">
                <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Grounding Directive</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  When answering patient queries regarding {selectedArticle.category.toLowerCase()}, CareOps micro-agents must strictly adhere to the operational limits specified in this SOP.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an SOP from the list to view its complete operational protocol.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
