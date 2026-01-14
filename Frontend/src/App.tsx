import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import EngineerManagement from "./pages/EngineerManagement";
import AssetManagement from "./pages/AssetManagement";
import ScheduleView from "./pages/ScheduleView";
import AuditLog from "./pages/AuditLog";
// Upgraded Icons for a tech look
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"; 

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-[#06080a] text-slate-200 font-mono overflow-hidden">
        
        {/* Sidebar Container: Sleek, deep borders and tech-matte finish */}
        <div className={`relative flex flex-col bg-[#0d1117] border-r border-slate-800/50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "w-20" : "w-64"}`}>
          
          {/* Main Navigation - Receives the collapse state */}
          <Sidebar collapsed={isCollapsed} />

          {/* Minimalist Toggle: Positioned at the bottom with thin lines */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-t border-slate-800/40 hover:bg-blue-500/5 transition-all duration-300 flex items-center justify-center text-slate-500 hover:text-blue-400 group"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} strokeWidth={1.5} className="animate-in fade-in zoom-in duration-300" />
            ) : (
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left-2">
                <PanelLeftClose size={18} strokeWidth={1.5} />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">Collapse Console</span>
              </div>
            )}
          </button>
        </div>

        {/* Dynamic Main Content: Uses a subtle radial gradient for depth */}
        <main className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(at_top_right,_#111827,_#000000)]">
          <div className="max-w-[1600px] mx-auto min-h-full">
             <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/engineers" element={<EngineerManagement />} />
                <Route path="/assets" element={<AssetManagement />} />
                <Route path="/scheduler" element={<ScheduleView />} />
                <Route path="/audit" element={<AuditLog />} />
             </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}