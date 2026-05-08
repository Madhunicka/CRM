'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Users, 
  Target, 
  Trophy, 
  XCircle, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Zap,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  proposalLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalValue: number;
  wonValue: number;
  recentLeads: Array<{
    id: string;
    name: string;
    company: string;
    status: string;
    assignedTo?: { name: string | null };
  }>;
  conversionRate: string;
  avgDeal: number;
}

const statusColors: Record<string, string> = {
  'New': 'bg-blue-500/10 text-blue-400',
  'Contacted': 'bg-indigo-500/10 text-indigo-400',
  'Qualified': 'bg-purple-500/10 text-purple-400',
  'Proposal Sent': 'bg-amber-500/10 text-amber-400',
  'Won': 'bg-emerald-500/10 text-emerald-400',
  'Lost': 'bg-red-500/10 text-red-400',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'blue', trend: '+12%', positive: true },
    { label: 'New Leads', value: stats.newLeads, icon: Target, color: 'indigo', trend: '+5%', positive: true },
    { label: 'Qualified', value: stats.qualifiedLeads, icon: TrendingUp, color: 'purple', trend: '+18%', positive: true },
    { label: 'Won Deals', value: stats.wonLeads, icon: Trophy, color: 'emerald', trend: '+8%', positive: true },
    { label: 'Lost Leads', value: stats.lostLeads, icon: XCircle, color: 'red', trend: '-2%', positive: false },
  ];

  const pipelineStages = [
    { label: 'New', count: stats.newLeads, color: 'bg-blue-500', pct: stats.totalLeads > 0 ? (stats.newLeads / stats.totalLeads * 100) : 0 },
    { label: 'Contacted', count: stats.contactedLeads, color: 'bg-indigo-500', pct: stats.totalLeads > 0 ? (stats.contactedLeads / stats.totalLeads * 100) : 0 },
    { label: 'Qualified', count: stats.qualifiedLeads, color: 'bg-purple-500', pct: stats.totalLeads > 0 ? (stats.qualifiedLeads / stats.totalLeads * 100) : 0 },
    { label: 'Proposal', count: stats.proposalLeads, color: 'bg-amber-500', pct: stats.totalLeads > 0 ? (stats.proposalLeads / stats.totalLeads * 100) : 0 },
    { label: 'Won', count: stats.wonLeads, color: 'bg-emerald-500', pct: stats.totalLeads > 0 ? (stats.wonLeads / stats.totalLeads * 100) : 0 },
    { label: 'Lost', count: stats.lostLeads, color: 'bg-red-500', pct: stats.totalLeads > 0 ? (stats.lostLeads / stats.totalLeads * 100) : 0 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Executive Overview</h1>
        <p className="text-gray-400">Real-time performance metrics and sales pipeline analysis.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-gray-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Value Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <DollarSign className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <div className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">Total Pipeline Value</div>
            <div className="text-5xl font-extrabold mb-6 tracking-tighter">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-semibold">
                Estimated Value
              </div>
              <div className="text-gray-400 text-sm">Across {stats.totalLeads} active leads</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Trophy className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4">Revenue Generated (Won)</div>
            <div className="text-5xl font-extrabold mb-6 tracking-tighter text-emerald-500">
              {formatCurrency(stats.wonValue)}
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
                Actual Revenue
              </div>
              <div className="text-gray-400 text-sm">From {stats.wonLeads} closed deals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Health */}
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
          <h3 className="text-xl font-bold mb-2">Pipeline Health</h3>
          <p className="text-gray-500 text-sm mb-8">Live breakdown by stage</p>
          <div className="space-y-5">
            {pipelineStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-400">{stage.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">{stage.count} leads</span>
                    <span className="text-xs font-bold text-white">{stage.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics & Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500 font-medium">Win Rate</span>
                </div>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-gray-500 font-medium">Avg. Deal Size</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(stats.avgDeal)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-500 font-medium">Active Deals</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalLeads - stats.wonLeads - stats.lostLeads}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500 font-medium">In Proposal</span>
                </div>
                <div className="text-2xl font-bold">{stats.proposalLeads}</div>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Recent Leads</h3>
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.company}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[lead.status] || 'bg-gray-500/10 text-gray-400'}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
              {stats.recentLeads.length === 0 && (
                <p className="text-gray-600 text-sm italic">No leads yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
