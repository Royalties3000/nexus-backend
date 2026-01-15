import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { API_BASE } from "../api/client";
import { Timer, Activity, CheckCircle2, AlertTriangle, Zap, ShieldCheck } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string; // This will map to actual_completed_at
  signal_received_at: string;
  actual_start_at: string;
  actual_completed_at: string;
  event_type: string;
  engineer: string;
  asset: string;
  severity: string;
  description: string;
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    eventType: "ALL",
    engineerId: "",
  });

  useEffect(() => {
    fetchAuditLog();
    const interval = setInterval(fetchAuditLog, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, filters]);

  async function fetchAuditLog() {
    try {
      const res = await fetch(`${API_BASE}/audit`);
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch audit log:", err);
    }
  }

  // Helper to calculate time difference in minutes
  const getDiffMinutes = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / 60000);
  };

  function applyFilters() {
    let filtered = [...entries];
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter((e) => new Date(e.timestamp) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => new Date(e.timestamp) <= to);
    }
    if (filters.eventType !== "ALL") {
      filtered = filtered.filter((e) => e.event_type === filters.eventType);
    }
    if (filters.engineerId) {
      filtered = filtered.filter((e) =>
        e.engineer.toLowerCase().includes(filters.engineerId.toLowerCase())
      );
    }
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredEntries(filtered);
  }

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case "ASSIGNMENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REPAIR_COMPLETE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SYSTEM_RECOVERY": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "CRITICAL_FAILURE": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-8 font-mono overflow-auto">
      <Header
        title="Nexus Audit Vault"
        subtitle="Immutable digital ledger of all system allocations and lifecycle metrics"
      />

      {/* Filter Terminal */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Log Filter Interface</h2>
          </div>
          <div className="text-[10px] text-slate-600 font-black italic uppercase">Vault Status: Encrypted & Persisted</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] uppercase text-slate-500 font-black mb-2 tracking-tighter">Start Window</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-500 font-black mb-2 tracking-tighter">End Window</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-500 font-black mb-2 tracking-tighter">Protocol Type</label>
            <select value={filters.eventType} onChange={(e) => setFilters({ ...filters, eventType: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-xs outline-none focus:border-blue-500">
              <option value="ALL">All Protocols</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="REPAIR_COMPLETE">Repair Complete</option>
              <option value="SYSTEM_RECOVERY">Recovery</option>
              <option value="CRITICAL_FAILURE">Failure</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-500 font-black mb-2 tracking-tighter">Personnel ID</label>
            <input type="text" value={filters.engineerId} onChange={(e) => setFilters({ ...filters, engineerId: e.target.value })} placeholder="Filter by Name..." className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-xs placeholder-slate-700 outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Lifecycle Data Table */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48 italic underline">Time_Vector</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Classification</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Execution_Metrics</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Personnel</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Asset_Node</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic_Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredEntries.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-600 italic text-sm">No synchronized logs found.</td></tr>
            ) : (
              filteredEntries.map((entry) => {
                const totalLeadTime = getDiffMinutes(entry.signal_received_at, entry.actual_completed_at);
                const actualRepairTime = getDiffMinutes(entry.actual_start_at, entry.actual_completed_at);
                
                return (
                  <tr key={entry.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-300 font-bold tracking-tighter italic">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[12px] text-blue-500 font-black tracking-widest">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-[9px] font-black border tracking-tighter uppercase ${getEventTypeStyle(entry.event_type)}`}>
                        {entry.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Timer size={12} className="text-emerald-500" />
                          <span className="text-[10px] text-white font-black">{actualRepairTime}m <span className="text-slate-600 font-normal">Repair</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap size={12} className={totalLeadTime > 120 ? "text-red-500" : "text-cyan-500"} />
                          <span className={`text-[10px] font-black ${totalLeadTime > 120 ? "text-red-500" : "text-cyan-400"}`}>
                            {totalLeadTime}m <span className="opacity-50 font-normal underline">LeadTime</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors uppercase italic underline">
                      {entry.engineer}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-400">{entry.asset}</span>
                         <span className="text-[8px] text-slate-600 font-black tracking-widest">AUTH_ID: {String(entry.id).substring(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed max-w-md italic">
                      {entry.description || "No manual log provided by personnel."}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}