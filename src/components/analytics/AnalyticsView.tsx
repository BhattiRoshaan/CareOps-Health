import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { aiMetrics } = useApp();

  const volumeTrendData = [
    { day: 'Mon', chat: 320, voice: 180, automated: 420 },
    { day: 'Tue', chat: 410, voice: 210, automated: 530 },
    { day: 'Wed', chat: 480, voice: 260, automated: 640 },
    { day: 'Thu', chat: 520, voice: 290, automated: 690 },
    { day: 'Fri', chat: 590, voice: 340, automated: 780 },
    { day: 'Sat', chat: 280, voice: 140, automated: 360 },
    { day: 'Sun', chat: 210, voice: 95, automated: 270 }
  ];

  const categoryDistribution = [
    { name: 'Appointments & Scheduling', value: 38, color: '#14b8a6' },
    { name: 'Claims & Prior Auth', value: 26, color: '#3b82f6' },
    { name: 'Billing & Payments', value: 20, color: '#8b5cf6' },
    { name: 'Insurance Eligibility', value: 11, color: '#f59e0b' },
    { name: 'Human Escalations', value: 5, color: '#f43f5e' }
  ];

  const deflectionSavings = [
    { month: 'May', manualCost: 48000, aiCost: 9200 },
    { month: 'Jun', manualCost: 52000, aiCost: 9800 },
    { month: 'Jul', manualCost: 59000, aiCost: 10400 },
    { month: 'Aug', manualCost: 65000, aiCost: 11100 }
  ];

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Operations Analytics & ROI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operational indicators, resolution velocity, and financial deflection metrics
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 mr-1.5">Estimated Monthly Savings:</span>
          <span className="font-semibold text-slate-900">$53,900 / mo</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Conversations Handled</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {(aiMetrics?.conversationsHandled ?? aiMetrics?.totalConversations ?? 4328).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            +18.4% compared to previous month
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">First-Contact Resolution</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {aiMetrics?.firstContactResolutionRate ?? 91.2}%
          </div>
          <div className="text-xs text-teal-600 font-medium mt-1">
            Zero repetitive transfers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Avg AI Voice Response</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {aiMetrics?.voiceAvgLatencySec ?? 1.2}s
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Low-latency streaming WebRTC
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Prior Auth Turnaround</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {aiMetrics?.priorAuthAvgTurnaroundHours ?? 3.2}h
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            96% faster than 72h manual SLA
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Interaction Volume & Deflection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Weekly Interaction Volume & Autonomous Deflection
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="automated" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} name="Automated by AI" />
                <Area type="monotone" dataKey="chat" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Chat Inquiries" />
                <Area type="monotone" dataKey="voice" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Voice Calls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Query Category Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Operational Workload Distribution (%)
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Savings / Deflection Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Monthly Operational Overhead: Traditional Staffing vs CareOps AI Platform ($)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deflectionSavings}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="manualCost" fill="#94a3b8" name="Traditional Call Center / Staff Cost" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiCost" fill="#14b8a6" name="CareOps AI Operational Cost" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
