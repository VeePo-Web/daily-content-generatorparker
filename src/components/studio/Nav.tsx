import { NavLink } from "react-router-dom";
import { CalendarDays, Clock, Settings } from "lucide-react";

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded transition-colors ${
      isActive
        ? "text-white bg-slate-700"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <>
      {/* Desktop nav — top right */}
      <nav className="hidden md:flex items-center gap-1">
        <NavLink to="/today" className={linkClass}>
          <CalendarDays size={14} />
          Today
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          <Clock size={14} />
          History
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={14} />
          Settings
        </NavLink>
      </nav>

      {/* Mobile nav — fixed bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-700 bg-slate-900">
        <NavLink
          to="/today"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-blue-400" : "text-slate-500"
            }`
          }
        >
          <CalendarDays size={18} />
          Today
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-blue-400" : "text-slate-500"
            }`
          }
        >
          <Clock size={18} />
          History
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-blue-400" : "text-slate-500"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </>
  );
}
