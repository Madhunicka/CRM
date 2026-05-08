'use client';

import { api } from '@/lib/api';
import { useState } from 'react';

const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

export function StatusSelect({ leadId, currentStatus, onStatusChange }: { leadId: string; currentStatus: string; onStatusChange?: () => void }) {
  const [status, setStatus] = useState(currentStatus);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatus(currentStatus); // revert on error
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      className="w-full lg:w-56 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer flex-1 lg:flex-none"
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
      ))}
    </select>
  );
}
