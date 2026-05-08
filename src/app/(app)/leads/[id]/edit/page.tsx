'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { EditLeadForm } from './EditLeadForm';
import { Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  dealValue: number;
  assignedTo?: { id: string; name: string | null } | null;
}

export default function EditLeadPage() {
  const params = useParams();
  const id = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [salespeople, setSalespeople] = useState<{ id: string; name: string | null }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Lead>(`/leads/${id}`),
      api.get<any[]>('/users')
    ]).then(([leadData, users]) => {
      setLead(leadData);
      setSalespeople(users);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return <EditLeadForm lead={lead} salespeople={salespeople} />;
}
