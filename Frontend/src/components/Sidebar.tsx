import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg";
// Minimalist Tech Icons
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar, 
  ClipboardList, 
  ShieldCheck 
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: SidebarItem[] = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { name: "Engineers", path: "/engineers", icon: <Users size={20} strokeWidth={1.5} /> },
    { name: "Assets", path: "/assets", icon: <Settings size={20} strokeWidth={1.5} /> },
    { name: "Scheduler", path: "/scheduler", icon: <Calendar size={20} strokeWidth={1.5} /> },
    { name: "Audit Log", path: "/audit", icon: <ClipboardList size={20} strokeWidth={1.5} /> },
  ];

  return (
    <aside className="w-full bg-[#0d1117] border-r border-slate-800/60 h-full flex flex-col font-mono overflow-hidden transition-all duration-300">
      
      {/* 1. TECH LOGO SECTION */}
      <div 
        onClick={() => navigate("/")}
        className="p-6 border-b border-slate-800/40 cursor-pointer hover:bg-slate-800/40 transition-all group"
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative">
             <img 
                src={Logo} 
                alt="logo" 
                className={`transition-all duration-500 ${collapsed ? "w-8 h-8" : "w-9 h-9"} group-hover:rotate-[360deg]`} 
              />
              <div className="absolute -inset-1 bg-blue-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {!collapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-sm font-black tracking-[0.2em] text-white whitespace-nowrap uppercase">
                Maint <span className="text-blue-500">Orc</span>
              </h2>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-0.5">Sentinel_OS</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. NAVIGATION LIST */}
      <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.name : ""}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                      : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <span className={`transition-colors duration-300 ${isActive ? "text-blue-400" : "group-hover:text-blue-300"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. SYSTEM STATUS FOOTER */}
      {!collapsed && (
        <div className="p-6 border-t border-slate-800/40 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 mb-3">
             <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </div>
             <span className="tracking-[0.2em] uppercase">Core_Link: Stable</span>
          </div>
          <div className="text-[10px] text-slate-400/80 bg-slate-900/50 p-2 rounded border border-slate-800/50 font-black text-center">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      )}
    </aside>
  );
}