'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, ArrowRight, DollarSign, Users, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Lead {
  id: string;
  name: string;
  company: string;
  status: string;
  dealValue: number;
  assignedTo?: { id: string; name: string | null } | null;
}

const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const stageConfig: Record<string, { color: string; bg: string; border: string; dot: string; hover: string }> = {
  'New':           { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-500',    hover: 'hover:border-blue-500/40' },
  'Contacted':     { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  dot: 'bg-indigo-500',  hover: 'hover:border-indigo-500/40' },
  'Qualified':     { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  dot: 'bg-purple-500',  hover: 'hover:border-purple-500/40' },
  'Proposal Sent': { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-500',   hover: 'hover:border-amber-500/40' },
  'Won':           { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500', hover: 'hover:border-emerald-500/40' },
  'Lost':          { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-500',     hover: 'hover:border-red-500/40' },
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(true);
    api.get<Lead[]>('/leads').then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a list or in the same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const leadId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update lead status:', error);
      setLeads(previousLeads); // Revert on failure
      alert('Failed to update lead status. Please try again.');
    }
  };

  if (loading || !enabled) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const byStage: Record<string, Lead[]> = {};
  for (const stage of stages) { 
    byStage[stage] = leads.filter((l) => l.status === stage); 
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Sales Pipeline</h1>
          <p className="text-gray-400">Visualise and manage your leads with drag-and-drop.</p>
        </div>
        <Link href="/leads/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
          <TrendingUp className="w-5 h-5" /> Add Lead
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 h-full items-start">
          {stages.map((stage) => {
            const cfg = stageConfig[stage]; 
            const stageLeads = byStage[stage] || [];
            const stageValue = stageLeads.reduce((sum, l) => sum + l.dealValue, 0);

            return (
              <div key={stage} className="flex flex-col min-w-[200px] h-full">
                <div className={cn('rounded-2xl p-4 mb-4 border transition-all', cfg.bg, cfg.border, cfg.hover)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                      <span className={cn('text-[10px] font-black uppercase tracking-[0.2em]', cfg.color)}>{stage}</span>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.bg, cfg.border, cfg.color)}>{stageLeads.length}</span>
                  </div>
                  <div className={cn('text-sm font-bold', cfg.color)}>{formatCurrency(stageValue)}</div>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 min-h-[500px] rounded-2xl transition-colors duration-200 p-2",
                        snapshot.isDraggingOver ? "bg-white/[0.03] ring-2 ring-white/5" : "bg-transparent"
                      )}
                    >
                      <div className="space-y-3">
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "group relative bg-white/[0.05] border border-white/5 rounded-2xl p-4 transition-all duration-200",
                                  snapshot.isDragging ? "shadow-2xl shadow-black/50 rotate-2 scale-105 border-blue-500/50 bg-white/[0.08] z-50" : "hover:bg-white/[0.08] hover:border-white/10"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                                      {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-white text-sm leading-tight group-hover:text-blue-400 transition-colors">
                                        {lead.name}
                                      </div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">{lead.company}</div>
                                    </div>
                                  </div>
                                  <Link href={`/leads/${lead.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-600 hover:text-blue-400 transition-colors">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
                                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(lead.dealValue)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lead.assignedTo && (
                                      <div 
                                        className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[9px] text-indigo-400 font-bold border border-indigo-500/20" 
                                        title={lead.assignedTo.name || ''}
                                      >
                                        {lead.assignedTo.name?.charAt(0)}
                                      </div>
                                    )}
                                    <GripVertical className="w-3 h-3 text-gray-700 group-hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {stageLeads.length === 0 && !snapshot.isDraggingOver && (
                          <div className="rounded-2xl border border-dashed border-white/5 p-6 text-center opacity-40">
                            <Users className="w-5 h-5 text-gray-700 mx-auto mb-2" />
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">No leads</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Pipeline Health</h3>
        <div className="flex h-3 w-full rounded-full overflow-hidden gap-1">
          {stages.map((stage) => { 
            const total = leads.length || 1; 
            const pct = (byStage[stage]?.length || 0) / total * 100; 
            const cfg = stageConfig[stage]; 
            return pct > 0 ? (
              <div 
                key={stage} 
                className={cn('h-full transition-all duration-500', cfg.dot)} 
                style={{ width: `${pct}%` }} 
                title={`${stage}: ${byStage[stage]?.length}`} 
              />
            ) : null; 
          })}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-8">
          {stages.map((stage) => { 
            const cfg = stageConfig[stage]; 
            const count = byStage[stage]?.length || 0; 
            return (
              <div key={stage} className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]', cfg.dot)} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stage}</span>
                  <span className={cn('text-sm font-bold', cfg.color)}>{count}</span>
                </div>
              </div>
            ); 
          })}
        </div>
      </div>
    </div>
  );
}
