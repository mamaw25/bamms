'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
      
      console.log('Total records:', attendance.length);
      console.log('First record:', attendance[0]);
      
      // Group attendance by date
      const groupedByDate: Record<string, AttendanceRecord[]> = {};
      
      attendance.forEach(record => {
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
        
        console.log(`Record date: ${record.date} -> Grouped as: ${dateStr}`);
        
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = [];
        }
        groupedByDate[dateStr].push(record);
      });

      console.log('Grouped dates:', Object.keys(groupedByDate));
      console.log('Date counts:', Object.entries(groupedByDate).map(([date, records]) => ({ date, count: records.length })));

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sort dates chronologically
      const sortedDates = Object.keys(groupedByDate).sort();
      console.log('Sorted dates:', sortedDates);

      // Create a sheet for each date
      sortedDates.forEach((dateStr, index) => {
        console.log(`Processing date ${index + 1}/${sortedDates.length}: ${dateStr}`);
        
        const records = groupedByDate[dateStr];
        
        // Create header
        const headers = ['Staff Member', 'ID Number', 'Email', 'Role', 'Clock In Time', 'Clock Out Time', 'Duration', 'Status'];
        
        // Create rows
        const rows = records.map(record => {
          const clockInTime = formatTime(record.check_in);
          const clockOutTime = formatTime(record.clock_out);
          const staffName = `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.trim();
          const status = record.clock_out ? 'Completed' : 'On Duty';
          
          // Calculate duration
          let duration = '--:--';
          if (record.check_in && record.clock_out) {
            const start = new Date(record.check_in).getTime();
            const end = new Date(record.clock_out).getTime();
            const diffMs = end - start;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs / (1000 * 60)) % 60);
            duration = `${hours}h ${mins}m`;
          }
          
          return [
            staffName,
            record.profiles?.unique_id_number || '',
            record.profiles?.email || '',
            record.profiles?.role || '',
            clockInTime,
            clockOutTime,
            duration,
            status
          ];
        });

        // Create worksheet data
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        const colWidths = [25, 15, 30, 15, 15, 15, 12, 12];
        worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

        // Style header row
        const headerStyle = {
          fill: { fgColor: { rgb: 'FF7C3AED' } },
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
        
        console.log(`Adding sheet: ${sheetName} with ${records.length} records`);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generate file
      const fileName = `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log(`Writing workbook with ${sortedDates.length} sheets`);
      XLSX.writeFile(workbook, fileName);
      console.log('Export complete');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleExportExcel}
        disabled={isExporting}
        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as Excel with separate tabs for each date"
      >
        <Download size={16} /> {isExporting ? 'Exporting...' : 'Export Excel'}
      </button>
    </div>
  );
}
