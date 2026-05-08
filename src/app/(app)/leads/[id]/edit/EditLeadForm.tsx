'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Building2, Mail, Phone, DollarSign, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  dealValue: number;
  assignedTo?: { id: string; name: string | null } | null;
};

export function EditLeadForm({ lead, salespeople }: { lead: Lead, salespeople: { id: string; name: string | null }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      source: formData.get('source'),
      status: formData.get('status') || 'New',
      dealValue: formData.get('dealValue'),
      assignedToId: formData.get('assignedToId'),
    };

    try {
      await api.put(`/leads/${lead.id}`, body);
      router.push(`/leads/${lead.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <Link
          href={`/leads/${lead.id}`}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">CRM / LEADS / EDIT</div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Lead: {lead.name}</h1>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">Primary Contact & Company</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="name" required defaultValue={lead.name}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Company Name *</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="company" required defaultValue={lead.company}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email Address *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" name="email" required defaultValue={lead.email}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Phone Number *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="tel" name="phone" required defaultValue={lead.phone}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Deal Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">Opportunity Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Lead Source *</label>
                <select name="source" required defaultValue={lead.source}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'].map(s => (
                    <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Status</label>
                <select name="status" defaultValue={lead.status}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map(s => (
                    <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Estimated Value ($)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input type="number" name="dealValue" required min="0" step="100" defaultValue={lead.dealValue}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium text-gray-400 ml-1">Assigned Salesperson *</label>
                <select name="assignedToId" required defaultValue={lead.assignedTo?.id}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer">
                  {salespeople.map(sp => (
                    <option key={sp.id} value={sp.id} className="bg-[#1a1a1a]">{sp.name || 'Unknown'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <Link href={`/leads/${lead.id}`} className="px-8 py-3.5 rounded-xl text-gray-400 font-semibold hover:bg-white/5 transition-all">
              Cancel
            </Link>
            <button
              type="submit" disabled={isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-10 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
              {!isPending && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
