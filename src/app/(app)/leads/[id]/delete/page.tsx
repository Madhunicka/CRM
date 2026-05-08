'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertTriangle, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  company: string;
}

export default function DeleteLeadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get<Lead>(`/leads/${id}`)
      .then(setLead)
      .catch(() => router.push('/leads'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/leads/${id}`);
      router.push('/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      setDeleting(false);
    }
  }

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <Link
          href={`/leads/${id}`}
          className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Danger Zone</div>
          <h1 className="text-3xl font-bold tracking-tight">Delete Lead</h1>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-10 text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Are you sure?</h2>
          <p className="text-gray-400 leading-relaxed">
            You are about to permanently delete the lead for{' '}
            <span className="text-white font-bold">{lead.name}</span> from{' '}
            <span className="text-white font-bold">{lead.company}</span>.
          </p>
          <p className="text-red-400 text-sm mt-3 font-medium">
            This action cannot be undone. All notes associated with this lead will also be deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/leads/${id}`}
            className="flex-1 px-8 py-3.5 rounded-xl text-gray-300 font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-500 transition-all active:scale-[0.98] shadow-lg shadow-red-500/25 disabled:opacity-70"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Yes, Delete Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
