'use client'

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, UserCheck, ShieldCheck, Users } from 'lucide-react';
import { AttendanceReport } from './action';

export default function ExportButton({ data }: { data: AttendanceReport[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (roleFilter: 'ALL' | 'ADMIN' | 'STAFF') => {
    const filteredData = data.filter(row => {
      // Logic: 'admin' role displays as ADMIN, everything else as STAFF
      const userRole = row.profiles.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'STAFF';
      if (roleFilter === 'ALL') return true;
      return userRole === roleFilter;
    });

    if (filteredData.length === 0) {
      alert(`No records found for ${roleFilter}`);
      return;
    }

    const headers = ["Staff Name", "ID Number", "Role", "Date", "Clock In", "Clock Out", "Duration"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => {
        const displayRole = row.profiles.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'STAFF';
        return [
          `"${row.profiles.first_name} ${row.profiles.last_name}"`,
          `"${row.profiles.unique_id_number}"`,
          `"${displayRole}"`,
          row.date,
          new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          row.clock_out 
            ? new Date(row.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            : "N/A",
          row.duration
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${roleFilter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
      >
        <Download size={18} />
        Export CSV
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
          <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Scope</p>
          
          <button 
            onClick={() => handleExport('ALL')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Users size={16} /> All Roles
          </button>

          <button 
            onClick={() => handleExport('STAFF')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <UserCheck size={16} /> Staff Only
          </button>

          <button 
            onClick={() => handleExport('ADMIN')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <ShieldCheck size={16} /> Admin Only
          </button>
        </div>
      )}
    </div>
  );
}