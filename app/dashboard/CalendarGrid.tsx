'use client'

import { useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, LogOut, Timer, Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string; 
  status: 'present' | 'absent' | 'late';
  check_in: string;
  clock_out?: string;
  work_from_home?: boolean;
}

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  request_type: 'leave' | 'absent' | 'day_off';
  reason?: string
  admin_notes?: string
  status: string
}

export default function CalendarGrid({ 
  daysInMonth, 
  firstDayOfMonth, 
  attendanceData,
  leaveRequests = []
}: { 
  daysInMonth: number, 
  firstDayOfMonth: number,
  attendanceData: AttendanceRecord[],
  leaveRequests?: LeaveRequest[]
}) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const now = new Date();

  const getDayDetails = (day: number) => {
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceData.find(a => a.date === dateString);
  };

  const getLeaveStatus = (day: number) => {
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const leave = leaveRequests.find(
      req => (req.status === 'approved' || req.status === 'rejected') && dateString >= req.start_date && dateString <= req.end_date
    );
    return leave;
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
          const leaveStatus = getLeaveStatus(day);
          const isToday = day === now.getDate();
          const hasClockInOut = details && leaveStatus;
          const dateObj = new Date(now.getFullYear(), now.getMonth(), day);
          const isPastDate = dateObj < now && day !== now.getDate();
          const isAbsentPastDate = isPastDate && !details && !leaveStatus;

          return (
            <button 
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`h-14 border-2 rounded-md flex flex-col items-center justify-center text-sm transition relative z-10
                ${isAbsentPastDate ? 'border-gray-400 bg-gray-50' : leaveStatus ? (leaveStatus.status === 'rejected' ? 'border-red-500 bg-red-100' : leaveStatus.request_type === 'day_off' ? 'border-purple-400 bg-purple-50' : leaveStatus.request_type === 'absent' ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50') : isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                hover:shadow-md active:scale-95`}
            >
              <span className={`font-semibold text-xs ${isAbsentPastDate ? 'text-gray-600' : leaveStatus ? (leaveStatus.status === 'rejected' ? 'text-red-700 line-through font-bold' : leaveStatus.request_type === 'day_off' ? 'text-purple-700' : leaveStatus.request_type === 'absent' ? 'text-red-700' : 'text-amber-700') : isToday ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>
              {isAbsentPastDate ? (
                <>
                  <span className="text-xs font-bold text-gray-500 mt-0.5">✕</span>
                </>
              ) : leaveStatus ? (
                <>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${leaveStatus.status === 'rejected' ? 'bg-red-500' : leaveStatus.request_type === 'day_off' ? 'bg-purple-500' : leaveStatus.request_type === 'absent' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  {leaveStatus.status === 'rejected' && (
                    <span className="text-xs font-bold text-red-600 mt-0.5">✕</span>
                  )}
                  {hasClockInOut && (
                    <span className={`absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded-full border ${details?.clock_out ? 'bg-green-500 text-white border-green-600' : 'bg-orange-500 text-white border-orange-600'}`} title={details?.clock_out ? 'Clocked Out' : 'Clocked In'}>
                      {details?.clock_out ? '✓' : '◐'}
                    </span>
                  )}
                </>
              ) : details && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${details.work_from_home ? 'bg-purple-500' : details.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} title={details.work_from_home ? 'Work From Home' : 'On-Site'} />
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
              <h3 className="text-xl font-bold text-gray-800">Day Details</h3>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p className="font-medium text-gray-500 border-b pb-2">
                {now.toLocaleString('default', { month: 'long' })} {selectedDate}, {now.getFullYear()}
              </p>
              
              {(() => {
                const dateObj = new Date(now.getFullYear(), now.getMonth(), selectedDate);
                const isPastDate = dateObj < now && selectedDate !== now.getDate();
                const isAbsentPastDate = isPastDate && !getDayDetails(selectedDate) && !getLeaveStatus(selectedDate);
                
                if (isAbsentPastDate) {
                  return (
                    <div className="p-4 rounded-xl bg-gray-100 text-gray-700 border border-gray-300 flex flex-col gap-3">
                      <div className="flex items-center gap-2 font-bold text-lg">
                        <span>⚠️</span>
                        <span>No Attendance</span>
                      </div>
                      <p className="text-sm">You were not present on this date and have no approved leave or day-off request.</p>
                    </div>
                  );
                }
                
                return (
                  <>
                    {getLeaveStatus(selectedDate) ? (
                <div>
                  {(() => {
                    const leave = getLeaveStatus(selectedDate)!;
                    if (leave.status === 'rejected') {
                      return (
                        <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-700">
                          <div className="flex items-center gap-2 font-bold mb-3 text-lg text-red-600">
                            <span>❌</span>
                            <span>Request Rejected</span>
                          </div>
                          <div className="text-sm space-y-2">
                            <div className="text-red-600">
                              <p className="font-medium text-xs mb-1">Request Type:</p>
                              <p className="font-semibold">{leave.request_type === 'day_off' ? 'Day Off' : leave.request_type === 'absent' ? 'Absent' : 'Leave'}</p>
                            </div>
                            {leave.reason && (
                              <div className="bg-white p-2 rounded border-l-4 border-red-400">
                                <p className="font-medium text-gray-600 text-xs mb-1">Your Reason:</p>
                                <p className="text-gray-700">{leave.reason}</p>
                              </div>
                            )}
                            {leave.admin_notes && (
                              <div className="bg-white p-2 rounded border-l-4 border-red-500 border-l-4">
                                <p className="font-bold text-red-600 text-xs mb-1">⚠️ Rejection Reason:</p>
                                <p className="text-gray-700">{leave.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    const bgColor = leave.request_type === 'day_off' ? 'bg-purple-50 border-purple-100 text-purple-700' : leave.request_type === 'absent' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700';
                    const icon = leave.request_type === 'day_off' ? '🗓️' : leave.request_type === 'absent' ? '❌' : '🏖️';
                    const label = leave.request_type === 'day_off' ? 'Day Off' : leave.request_type === 'absent' ? 'Absent' : 'Leave';
                    
                    return (
                      <div className={`p-4 rounded-xl border ${bgColor}`}>
                        <div className="flex items-center gap-2 font-bold mb-3">
                          <span>{icon}</span>
                          <span>{label} (Approved)</span>
                        </div>
                        {leave.reason && (
                          <div className="text-sm opacity-90 bg-white/40 p-2 rounded mb-2">
                            <p className="font-medium text-gray-600 text-xs mb-1">Reason:</p>
                            <p>{leave.reason}</p>
                          </div>
                        )}
                        {leave.admin_notes && (
                          <div className="text-sm opacity-90 bg-white/40 p-2 rounded">
                            <p className="font-medium text-gray-600 text-xs mb-1">Admin Notes:</p>
                            <p>{leave.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : getDayDetails(selectedDate) ? (
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
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}