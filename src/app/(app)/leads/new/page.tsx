'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Building2, Mail, Phone, DollarSign, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [salespeople, setSalespeople] = useState<{ id: string; name: string | null }[]>([]);

  useEffect(() => {
    api.get<any[]>('/users').then(setSalespeople).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await api.post('/leads', {
        name: fd.get('name'), company: fd.get('company'), email: fd.get('email'),
        phone: fd.get('phone'), source: fd.get('source'), status: fd.get('status') || 'New',
        dealValue: fd.get('dealValue'), assignedToId: fd.get('assignedToId'),
      });
      router.push('/leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <Link href="/leads" className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">CRM / LEADS</div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Opportunity</h1>
        </div>
      </div>
      <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><User className="w-4 h-4" /></div>
              <h2 className="text-lg font-bold">Primary Contact & Company</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="name" required placeholder="e.g. Robert Fox" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Company Name *</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="company" required placeholder="e.g. Acme Industries" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email Address *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" name="email" required placeholder="robert@acme.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Phone Number *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="tel" name="phone" required placeholder="+1 (555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><DollarSign className="w-4 h-4" /></div>
              <h2 className="text-lg font-bold">Opportunity Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Lead Source *</label>
                <select name="source" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {['Website','LinkedIn','Referral','Cold Email','Event','Other'].map(s=><option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Initial Status</label>
                <select name="status" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {['New','Contacted','Qualified','Proposal Sent'].map(s=><option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Estimated Value ($)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input type="number" name="dealValue" required min="0" step="100" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium text-gray-400 ml-1">Assigned Salesperson *</label>
                <select name="assignedToId" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {salespeople.map(sp => (
                    <option key={sp.id} value={sp.id} className="bg-[#1a1a1a]">{sp.name || 'Unknown'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{error}</div>}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <Link href="/leads" className="px-8 py-3.5 rounded-xl text-gray-400 font-semibold hover:bg-white/5 transition-all">Cancel</Link>
            <button type="submit" disabled={isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-10 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-500/25 flex items-center gap-2">
              {isPending ? 'Processing...' : 'Create Opportunity'}
              {!isPending && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
