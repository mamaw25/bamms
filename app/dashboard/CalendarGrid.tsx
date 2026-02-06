'use client'

import { useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, LogOut, Timer } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string; 
  status: 'present' | 'absent' | 'late';
  check_in: string;
  clock_out?: string;
}

export default function CalendarGrid({ 
  daysInMonth, 
  firstDayOfMonth, 
  attendanceData 
}: { 
  daysInMonth: number, 
  firstDayOfMonth: number,
  attendanceData: AttendanceRecord[] 
}) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const now = new Date();

  const getDayDetails = (day: number) => {
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceData.find(a => a.date === dateString);
  };

  // Helper to calculate duration between two ISO strings
  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffInMs = endTime - startTime;
    
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 bg-gray-50/30 rounded-md"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const details = getDayDetails(day);
          const isToday = day === now.getDate();

          return (
            <button 
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`h-14 border rounded-md flex flex-col items-center justify-center text-sm transition relative z-10
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                hover:border-blue-400 hover:shadow-md active:scale-95`}
            >
              <span className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>
              {details && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${details.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Pop-up Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Attendance Details</h3>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p className="font-medium text-gray-500 border-b pb-2">
                {now.toLocaleString('default', { month: 'long' })} {selectedDate}, {now.getFullYear()}
              </p>
              
              {getDayDetails(selectedDate) ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-100">
                    <div className="flex items-center gap-2 font-bold mb-3">
                      <CheckCircle2 size={18}/> Present
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500"/> 
                          <span className="text-gray-500 text-xs font-bold uppercase">In</span>
                        </div>
                        <span className="font-mono font-bold">
                          {new Date(getDayDetails(selectedDate)!.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {getDayDetails(selectedDate)?.clock_out && (
                        <>
                          <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <LogOut size={14} className="text-orange-500"/> 
                              <span className="text-gray-500 text-xs font-bold uppercase">Out</span>
                            </div>
                            <span className="font-mono font-bold">
                              {new Date(getDayDetails(selectedDate)!.clock_out!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-green-200 flex items-center justify-between text-green-800">
                            <div className="flex items-center gap-2 font-bold">
                              <Timer size={16} />
                              <span>Total Worked</span>
                            </div>
                            <span className="text-lg font-black tracking-tight">
                              {calculateDuration(
                                getDayDetails(selectedDate)!.check_in, 
                                getDayDetails(selectedDate)!.clock_out!
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-2 font-bold">
                  <XCircle size={18}/> No Record
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}