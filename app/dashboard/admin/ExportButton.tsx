'use client'

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, UserCheck, ShieldCheck, Users } from 'lucide-react';
import { AttendanceReport } from './action';

export default function ExportButton({ data }: { data: AttendanceReport[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async (roleFilter: 'ALL' | 'ADMIN' | 'STAFF') => {
    setIsExporting(true);
    try {
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
      
      const filteredData = data.filter(row => {
        // Logic: 'admin' role displays as ADMIN, everything else as STAFF
        const userRole = row.profiles.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'STAFF';
        if (roleFilter === 'ALL') return true;
        return userRole === roleFilter;
      });

      if (filteredData.length === 0) {
        alert(`No records found for ${roleFilter}`);
        setIsExporting(false);
        return;
      }

      // Group by date
      const groupedByDate: Record<string, AttendanceReport[]> = {};
      
      filteredData.forEach(record => {
        // Parse date - handle DD/MM/YYYY or YYYY-MM-DD formats
        let dateStr = '';
        
        const dateValue = String(record.date).trim();
        if (dateValue.includes('/')) {
          // DD/MM/YYYY format
          const [day, month, year] = dateValue.split('/');
          dateStr = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
        } else {
          // Assume it's already YYYY-MM-DD or similar
          dateStr = dateValue.substring(0, 10);
        }
        
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = [];
        }
        groupedByDate[dateStr].push(record);
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sort dates chronologically
      const sortedDates = Object.keys(groupedByDate).sort();

      // Create a sheet for each date
      sortedDates.forEach((dateStr) => {
        const records = groupedByDate[dateStr];
        
        // Create header
        const headers = ['Staff Member', 'ID Number', 'Role', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Location', 'Status'];
        
        // Create rows
        const rows = records.map(record => {
          const displayRole = record.profiles.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'STAFF';
          const clockInTime = new Date(record.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const clockOutTime = record.clock_out 
            ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : 'N/A';
          const location = record.work_from_home ? 'Work From Home' : 'On-Site';
          
          return [
            `${record.profiles.first_name} ${record.profiles.last_name}`,
            record.profiles.unique_id_number || '',
            displayRole,
            record.date,
            clockInTime,
            clockOutTime,
            record.duration,
            location,
            record.clock_out ? 'Completed' : 'On Duty'
          ];
        });

        // Create worksheet data
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        const colWidths = [25, 15, 12, 15, 15, 15, 12, 12];
        worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

        // Style header row
        const headerStyle = {
          fill: { fgColor: { rgb: 'FF3B82F6' } },
          font: { bold: true, color: { rgb: 'FFFFFFFF' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };

        for (let i = 0; i < headers.length; i++) {
          const cellAddress = XLSX.utils.encode_col(i) + '1';
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = headerStyle;
          }
        }

        // Format sheet name - dateStr is now YYYY-MM-DD, convert to DD-MM-YYYY for tab name
        const [year, month, day] = dateStr.split('-');
        const sheetName = `${day}-${month}-${year}`;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generate file
      const fileName = `attendance_${roleFilter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={18} />
        {isExporting ? 'Exporting...' : 'Export Excel'}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
          <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Scope</p>
          
          <button 
            onClick={() => handleExport('ALL')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <Users size={16} /> All Roles
          </button>

          <button 
            onClick={() => handleExport('STAFF')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <UserCheck size={16} /> Staff Only
          </button>

          <button 
            onClick={() => handleExport('ADMIN')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={16} /> Admin Only
          </button>
        </div>
      )}
    </div>
  );
}