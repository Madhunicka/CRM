'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft, Building2, Mail, Phone, Clock, DollarSign,
  MessageSquare, History, Send, MoreVertical, Info, Pencil, Calendar, Loader2, Zap
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, cn, calculateLeadScore } from '@/lib/utils';
import { StatusSelect } from './StatusSelect';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

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
  updatedAt: string;
  notes: Note[];
  assignedTo?: { id: string; name: string | null; email: string } | null;
}

const statusColors: Record<string, string> = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Contacted': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Qualified': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Proposal Sent': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Won': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      const data = await api.get<Lead>(`/leads/${id}`);
      setLead(data);
    } catch {
      router.push('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/leads/${id}/notes`, { content: noteContent });
      setNoteContent('');
      fetchLead(); // Refresh to show new note
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAddingNote(false);
    }
  }

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const pipelineAge = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/leads"
            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-extrabold tracking-tight">{lead.name}</h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                statusColors[lead.status]
              )}>
                {lead.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <Building2 className="w-4 h-4" />
              {lead.company}
              <span className="mx-2 text-white/10">|</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Zap className={cn(
                  "w-3 h-3",
                  calculateLeadScore(lead.status, lead.dealValue) > 70 ? "text-amber-400 fill-amber-400" : "text-gray-500"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  Lead Score: {calculateLeadScore(lead.status, lead.dealValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <StatusSelect leadId={id} currentStatus={lead.status} onStatusChange={fetchLead} />
          <Link
            href={`/leads/${id}/edit`}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <Link
            href={`/leads/${id}/delete`}
            className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-semibold hover:bg-red-500/20 transition-all"
          >
            Delete
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Contact Info */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 space-y-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="space-y-5">
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Email Address</div>
                <div className="flex items-center gap-3 text-white font-medium">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="hover:text-blue-400 transition-colors break-all">{lead.email}</a>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Phone Number</div>
                <div className="flex items-center gap-3 text-white font-medium">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <a href={`tel:${lead.phone}`} className="hover:text-blue-400 transition-colors">{lead.phone}</a>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Assigned Salesperson</div>
                <div className="flex items-center gap-3 text-white font-medium">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] text-blue-500 font-bold border border-blue-500/20">
                    {lead.assignedTo?.name?.charAt(0) || 'U'}
                  </div>
                  {lead.assignedTo?.name || 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* Deal Value Card */}
          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/10 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-sm font-bold text-emerald-500/80 uppercase tracking-widest border-b border-emerald-500/10 pb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Deal Value
            </h3>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold tracking-tighter text-emerald-500">
                {formatCurrency(lead.dealValue)}
              </div>
              <div className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Expected Revenue</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Source</div>
                <div className="text-sm font-bold text-white">{lead.source}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Pipeline Age</div>
                <div className="text-sm font-bold text-white">{pipelineAge} Day{pipelineAge !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Created</div>
                <div className="text-gray-300 font-medium">{formatDate(lead.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Last Updated</div>
                <div className="text-gray-300 font-medium">{formatDate(lead.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notes Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 min-h-[600px] flex flex-col backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <History className="w-6 h-6 text-blue-500" />
                Communication Timeline
              </h3>
              <div className="text-xs text-gray-500 font-medium">
                {lead.notes.length} {lead.notes.length === 1 ? 'note' : 'notes'}
              </div>
            </div>

            {/* Add Note */}
            <form onSubmit={handleAddNote} className="mb-10 group">
              <div className="relative">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a progress update, call summary, or internal note..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pr-20 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={addingNote}
                  className="absolute bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="flex-1 space-y-8 relative">
              {lead.notes.length > 0 && (
                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />
              )}

              {lead.notes.map((note) => (
                <div key={note.id} className="relative pl-14 group">
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-[#0a0a0a] z-10 group-hover:scale-125 transition-transform" />
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 group-hover:bg-white/[0.08] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-500 font-bold">
                          {note.user.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white">{note.user.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <button className="text-gray-600 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}

              {lead.notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium opacity-40">No internal notes yet</p>
                  <p className="text-sm opacity-30 italic">Start the conversation by adding a note above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
