'use client';

import { Download } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  clock_out: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    unique_id_number: string | null;
    email: string | null;
    role: string | null;
  } | null;
}

export default function ExportButton({ attendance }: { attendance: AttendanceRecord[] }) {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch {
      return '--:--';
    }
  };

  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['Staff Member', 'ID Number', 'Email', 'Role', 'Date', 'Clock In Time', 'Clock Out Time', 'Status'];
    
    // Create CSV rows
    const rows = attendance.map(record => {
      const clockInTime = formatTime(record.check_in);
      const clockOutTime = formatTime(record.clock_out);
      const status = record.clock_out ? 'Completed' : 'On Duty';
      const staffName = `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.trim();
      const date = new Date(record.date).toLocaleDateString();
      
      return [
        staffName,
        record.profiles?.unique_id_number || '',
        record.profiles?.email || '',
        record.profiles?.role || '',
        date,
        clockInTime,
        clockOutTime,
        status
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExportCSV}
      className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
    >
      <Download size={16} /> Export CSV
    </button>
  );
}
