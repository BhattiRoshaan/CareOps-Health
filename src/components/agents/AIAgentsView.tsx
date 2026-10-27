import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIAgentDefinition } from '../../types';
import {
  Cpu,
  Bot,
  Zap,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Sparkles,
  Sliders,
  X
} from 'lucide-react';

export const AIAgentsView: React.FC = () => {
  const { aiAgents } = useApp();
  const [selectedAgent, setSelectedAgent] = useState<AIAgentDefinition | null>(aiAgents[0]);

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Micro-Agents Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {aiAgents.length} autonomous agents coordinating claims, scheduling, billing, and triage workflows
          </p>
        </div>
      </div>

      {/* Agents Grid & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Agent Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {aiAgents.map(agent => {
            const isSelected = selectedAgent?.id === agent.id;

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-400 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">{agent.id}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.2 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {agent.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {agent.description ?? agent.roleDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {agent.accuracyRate ?? agent.accuracyScore ?? 99}% Accuracy
                  </span>
                  <span className="font-mono text-teal-600 dark:text-teal-400">
                    {(agent.averageLatencySec ?? (agent.avgLatencyMs ? (agent.avgLatencyMs / 1000).toFixed(2) : 0.25))}s avg
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Agent Deep Inspector */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            Micro-Agent Configuration & Prompts
          </h2>

          {selectedAgent ? (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAgent.name}</h3>
                  <span className="text-[10px] font-mono text-teal-600 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.2 rounded font-bold">
                    {selectedAgent.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{selectedAgent.description ?? selectedAgent.roleDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Executions</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {(selectedAgent.handledRequestsToday ?? selectedAgent.handledQueriesToday ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Latency Target</div>
                  <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                    {(selectedAgent.averageLatencySec ?? (selectedAgent.avgLatencyMs ? (selectedAgent.avgLatencyMs / 1000).toFixed(2) : 0.25))}s
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Assigned Domain Tools</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.tools.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                      🔧 {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">System Prompt Directive</div>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800">
                  {selectedAgent.systemPromptSummary || (selectedAgent as any).systemPrompt || 'Directive active.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an agent to inspect its tools and prompt configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
