import { useState, useEffect } from "react";
import { API_BASE } from "../api/client";
import { Header } from "../components/Header";
import { SchedulerConsole } from "../components/SchedulerConsole";
import { CheckCircle2, AlertOctagon, Zap, Clock, ArrowLeft, Calendar as CalIcon, User } from "lucide-react";

interface Assignment {
  id: string;
  asset_name: string;
  engineer_name: string;
  start_date: string;
  end_time: string; 
  duration_hours: number;
  type: "CRITICAL" | "ROUTINE" | "DECAY_REPAIR";
}

const PRIORITY_THEME = {
  CRITICAL: { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/50", ghost: "bg-red-950/30", icon: <AlertOctagon size={10} className="animate-pulse" /> },
  DECAY_REPAIR: { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/50", ghost: "bg-amber-950/30", icon: <Zap size={10} /> },
  ROUTINE: { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/50", ghost: "bg-blue-950/30", icon: <Clock size={10} /> }
};

export default function ScheduleView() {
  const [viewMode, setViewMode] = useState<"calendar" | "gantt">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const now = new Date(); // Today/Now reference

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/assignments`);
      const data = await response.json();

      const normalized = (data || []).map((d: any) => {
        const start = d.start_date ? new Date(d.start_date) : new Date();
        let end: Date;
        if (d.end_time) {
          end = new Date(d.end_time);
        } else if (d.duration_hours) {
          end = new Date(start.getTime() + Number(d.duration_hours) * 3600_000);
        } else {
          end = new Date(start.getTime() + 8 * 3600_000);
        }
        const duration_hours = Math.max(0, (end.getTime() - start.getTime()) / 3600_000);

        return {
          id: d.id ?? d.order_id ?? `${d.asset_name}-${start.toISOString()}`,
          asset_name: d.asset_name ?? "Unknown Asset",
          engineer_name: d.engineer_name ?? "Unassigned",
          start_date: start.toISOString(),
          end_time: end.toISOString(),
          duration_hours,
          type: d.type ?? "ROUTINE",
        } as Assignment;
      });

      setAssignments(normalized);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleComplete = async (orderId: string) => {
    setCompletingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/assignments/${orderId}/complete`, { method: 'PUT' });
      if (res.ok) setAssignments(prev => prev.filter(a => a.id !== orderId));
    } catch (err) { console.error(err); } 
    finally { setCompletingId(null); }
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const selectedDayTasks = selectedDay 
    ? assignments.filter(a => {
        const d = new Date(a.start_date);
        return d.getDate() === selectedDay && d.getMonth() === currentDate.getMonth();
      }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    : [];

  return (
    <div className="flex flex-col h-screen bg-[#0b0e14] text-slate-200 font-mono overflow-hidden">
      <div className="px-6 pt-4 flex-none">
        <Header title="Nexus Scheduler" subtitle="Personnel Allocation & Temporal Logic" />
        <div className="flex gap-2 my-4 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
          <button onClick={() => setViewMode("calendar")} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === "calendar" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"}`}>CALENDAR_DIARY</button>
          <button onClick={() => setViewMode("gantt")} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === "gantt" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"}`}>GANTT_CARTESIAN</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-blue-500 animate-pulse font-black italic">SYNCING_TEMPORAL_DATA...</div>
        ) : viewMode === "calendar" ? (
          <div className="h-full bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col relative overflow-hidden">
            
            {/* DIARY OVERLAY */}
            <div className={`absolute inset-0 bg-[#0b0e14] z-20 transition-all duration-500 ease-in-out transform ${selectedDay ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex h-full">
                <div className="w-16 border-r border-slate-800 flex flex-col items-center py-8 gap-8">
                   <button onClick={() => setSelectedDay(null)} className="p-3 bg-slate-900 rounded-full text-cyan-500 hover:scale-110 transition-transform"><ArrowLeft size={20}/></button>
                   <div className="h-full w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent" />
                </div>
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-4xl font-black text-white uppercase italic mb-1">Diary Entry: Day_{selectedDay}</h2>
                      <p className="text-xs text-slate-500 tracking-[0.3em]">CHRONOLOGICAL_WORKLOAD_MAP</p>
                    </div>
                    <div className="text-right border-r-2 border-cyan-500 pr-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Current_Temporal_Locus</p>
                      <p className="text-xl font-black text-cyan-400">{now.toLocaleTimeString([], { hour12: false })}</p>
                    </div>
                  </div>
                  
                  <div className="relative border-l-2 border-slate-800 ml-4 pl-10 space-y-12 py-4">
                    {selectedDayTasks.map(task => {
                        const start = new Date(task.start_date);
                        const end = new Date(task.end_time);
                        return (
                          <div key={task.id} className="relative group">
                            <div className="absolute -left-[49px] top-2 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#0b0e14] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <div className="flex items-start justify-between bg-slate-900/50 border border-slate-800 p-6 rounded-2xl group-hover:border-cyan-500/50 transition-colors">
                              <div>
                                <div className="text-cyan-500 font-black text-sm mb-2 uppercase tracking-tighter">
                                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} — {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <h4 className="text-xl font-bold text-white uppercase tracking-tight">{task.asset_name}</h4>
                                <p className="text-slate-400 flex items-center gap-2 mt-1"><User size={14} className="text-slate-600"/> {task.engineer_name}</p>
                              </div>
                              <div className={`${PRIORITY_THEME[task.type].bg} px-3 py-1 rounded-sm text-[10px] font-black text-black uppercase h-fit`}>{task.type}</div>
                            </div>
                          </div>
                        )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CALENDAR GRID */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-white uppercase tracking-widest text-sm">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h3>
                  <div className="text-[10px] bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded border border-cyan-500/20 font-black">
                    TIME_SYNC: {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">←</button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-blue-900/40 text-blue-400 border border-blue-500/30 hover:bg-blue-900/60 rounded-lg text-[10px] font-black uppercase">Today</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">→</button>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-slate-800 min-h-0 overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="bg-[#0f172a] p-2 text-center text-[9px] font-black text-slate-500 uppercase border-b border-slate-800">
                  {d}
                </div>
              ))}
              {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => <div key={`empty-${i}`} className="bg-[#0b0e14]/50" />)}
              {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                const day = i + 1;
                const isToday = day === now.getDate() && currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
                const count = assignments.filter(a => {
                  const d = new Date(a.start_date);
                  return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                }).length;

                return (
                  <div key={day} onClick={() => setSelectedDay(day)} className={`bg-[#0f172a] hover:bg-slate-800/40 cursor-pointer p-3 transition-all group flex flex-col justify-between relative ${isToday ? 'bg-cyan-950/20 ring-1 ring-inset ring-cyan-500/30' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className={`font-black text-xs ${isToday ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-500'}`}>{day < 10 ? `0${day}` : day}</span>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse" />}
                    </div>
                    <div className="flex gap-0.5 mt-auto">
                      {Array.from({ length: Math.min(count, 8) }).map((_, j) => (
                        <div key={j} className="flex-1 h-1 bg-cyan-500/60 rounded-full" />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* GANTT CARTESIAN VIEW */
          <div className="h-full bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
             <div className="p-6 border-b border-slate-800 grid grid-cols-[200px_1fr] gap-4">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Engineer_Reference</div>
                <div className="flex justify-between px-4 text-[9px] font-black text-slate-600 uppercase">
                    <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {assignments.map(a => {
                   const start = new Date(a.start_date);
                   const startHour = start.getHours() + start.getMinutes()/60;
                   const offset = ((startHour - 8) / 12) * 100;
                   const width = (a.duration_hours / 12) * 100;
                   const isCompleting = completingId === a.id;

                   return (
                     <div key={a.id} className={`grid grid-cols-[180px_1fr] gap-4 items-center group transition-all ${isCompleting ? 'opacity-0' : ''}`}>
                        <div className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{a.engineer_name}</div>
                        <div className="relative h-8 bg-slate-800/30 rounded-md border border-slate-800 shadow-inner overflow-hidden">
                           <div 
                              className={`absolute h-full ${PRIORITY_THEME[a.type].bg} flex items-center px-3 text-[9px] font-black text-black uppercase cursor-help hover:brightness-125 transition-all`}
                              style={{ left: `${Math.max(0, offset)}%`, width: `${width}%` }}
                              title={`${a.asset_name} | Start: ${start.toLocaleTimeString()}`}
                           >
                              {a.asset_name}
                           </div>
                           <button 
                            onClick={() => handleComplete(a.id)}
                            className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 bg-emerald-500 text-black px-2 py-0.5 rounded text-[8px] font-black"
                           >
                            MARK_COMPLETE
                           </button>
                        </div>
                     </div>
                   )
                })}
             </div>
             <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                <SchedulerConsole />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}