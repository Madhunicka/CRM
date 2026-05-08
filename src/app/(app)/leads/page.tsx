'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Plus, Search, Filter, Mail, Phone, Building2, Trash2, Pencil, Loader2, Download, Zap } from 'lucide-react';
import { formatCurrency, formatDate, cn, calculateLeadScore, downloadCSV } from '@/lib/utils';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  dealValue: number;
  createdAt: string;
  assignedTo?: { id: string; name: string | null; email: string } | null;
}

interface Salesperson {
  id: string;
  name: string | null;
}

const statusColors: Record<string, string> = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Contacted': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Qualified': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Proposal Sent': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Won': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const currentStatus = searchParams.get('status') || '';
  const currentSource = searchParams.get('source') || '';
  const currentSalesperson = searchParams.get('salesperson') || '';
  const currentQ = searchParams.get('q') || '';

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentStatus) params.set('status', currentStatus);
    if (currentSource) params.set('source', currentSource);
    if (currentSalesperson) params.set('salesperson', currentSalesperson);
    if (currentQ) params.set('q', currentQ);

    try {
      const data = await api.get<Lead[]>(`/leads?${params.toString()}`);
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSource, currentSalesperson, currentQ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    api.get<Salesperson[]>('/users').then(setSalespeople).catch(console.error);
  }, []);

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (currentStatus) params.set('status', currentStatus);
    if (currentSource) params.set('source', currentSource);
    if (currentSalesperson) params.set('salesperson', currentSalesperson);
    if (currentQ) params.set('q', currentQ);

    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    return `/leads?${params.toString()}`;
  };

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (currentStatus) params.set('status', currentStatus);
    if (currentSource) params.set('source', currentSource);
    if (currentSalesperson) params.set('salesperson', currentSalesperson);
    if (searchQuery) params.set('q', searchQuery);
    router.push(`/leads?${params.toString()}`);
  }

  const handleExport = () => {
    const exportData = leads.map(lead => ({
      Name: lead.name,
      Company: lead.company,
      Email: lead.email,
      Phone: lead.phone,
      Status: lead.status,
      Value: lead.dealValue,
      Source: lead.source,
      'Assigned To': lead.assignedTo?.name || 'Unassigned',
      'Created At': lead.createdAt
    }));
    downloadCSV(exportData, `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Lead Management</h1>
          <p className="text-gray-400">Track and manage your sales opportunities. <span className="text-white font-semibold">{leads.length}</span> results.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-semibold transition-all border border-white/10"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <Link
            href="/leads/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Add New Lead
          </Link>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        {/* Filters Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                Status:
              </div>
              <select 
                value={currentStatus || 'All'} 
                onChange={(e) => router.push(buildQuery({ status: e.target.value === 'All' ? '' : e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[140px]"
              >
                {['All', 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((status) => (
                  <option key={status} value={status} className="bg-[#1a1a1a]">{status}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-gray-500">Source:</div>
              <select 
                value={currentSource || 'All'} 
                onChange={(e) => router.push(buildQuery({ source: e.target.value === 'All' ? '' : e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[140px]"
              >
                {['All', 'Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'].map((source) => (
                  <option key={source} value={source} className="bg-[#1a1a1a]">{source}</option>
                ))}
              </select>
            </div>

            {/* Salesperson Filter */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-gray-500">Rep:</div>
              <select 
                value={currentSalesperson || 'All'} 
                onChange={(e) => router.push(buildQuery({ salesperson: e.target.value === 'All' ? '' : e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="All" className="bg-[#1a1a1a]">All Salespeople</option>
                {salespeople.map((sp) => (
                  <option key={sp.id} value={sp.id} className="bg-[#1a1a1a]">{sp.name}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full lg:w-72 group ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </form>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                  <th className="px-8 py-5">Lead & Company</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Value</th>
                  <th className="px-8 py-5">Score</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Assigned To</th>
                  <th className="px-8 py-5">Source</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold group-hover:scale-110 transition-transform">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            <Link href={`/leads/${lead.id}`}>{lead.name}</Link>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {lead.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                        statusColors[lead.status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-white tracking-tight">{formatCurrency(lead.dealValue)}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">USD Estimate</div>
                    </td>
                    <td className="px-8 py-5">
                      {(() => {
                        const score = calculateLeadScore(lead.status, lead.dealValue);
                        return (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <Zap className={cn(
                                "w-3 h-3",
                                score > 70 ? "text-amber-400 fill-amber-400" : "text-gray-600"
                              )} />
                              <span className={cn(
                                "text-xs font-bold",
                                score > 70 ? "text-amber-400" : "text-gray-400"
                              )}>{score}</span>
                            </div>
                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  score > 70 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
                                  score > 40 ? "bg-blue-500" : "bg-gray-600"
                                )} 
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-gray-600" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-gray-600" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold border border-indigo-500/20">
                          {lead.assignedTo?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-300">{lead.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-gray-400 font-medium">{lead.source}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-medium text-gray-300">{formatDate(lead.createdAt)}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"
                          title="View Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/leads/${lead.id}/delete`}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center text-gray-500 italic">
                      No leads found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
