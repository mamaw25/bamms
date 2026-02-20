'use client';

import { useEffect, useState } from 'react';
import { getMeetings, getMeetingAttendees } from './action';
import { createClient } from '@/lib/supabase/client';
import MeetingSchedulerForm from './MeetingSchedulerForm';
import UpcomingMeetingsTable from './UpcomingMeetingsTable';
import AttendeeTracker from './AttendeeTracker';
import MeetingMinutesForm from './MeetingMinutesForm';
import ExportMinutesButton from './ExportMinutesButton';
import { Calendar, Clock, MapPin, X } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  unique_id_number: string;
  email: string;
  role: string;
}

interface Attendee {
  id: string;
  staff_id: string;
  profiles: StaffMember;
  type?: 'manual' | 'auto_checkin';
}

export default function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    console.log('loadData called - refreshing meetings...');
    setLoading(true);
    
    // Load meetings
    const meetingsResult = await getMeetings();
    console.log('getMeetings result:', meetingsResult);
    if (meetingsResult.success) {
      console.log('Meetings loaded:', meetingsResult.data?.length || 0, 'meetings');
      setMeetings(meetingsResult.data || []);
    } else {
      console.error('Failed to load meetings:', meetingsResult.error);
    }

    // Load staff list
    const supabase = createClient();
    const { data: staff } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin');
    
    if (staff) {
      console.log('Staff loaded:', staff.length, 'staff members');
      setStaffList(staff);
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  const handleMeetingClick = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    const result = await getMeetingAttendees(meeting.id);
    if (result.success) {
      setSelectedAttendees(result.data || []);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthMeetings = meetings.filter((m) => {
      const meetingDate = new Date(m.date);
      return (
        meetingDate.getMonth() === currentMonth &&
        meetingDate.getFullYear() === currentYear
      );
    });

    const upcomingMeetings = meetings.filter((m) => {
      const meetingDateTime = new Date(`${m.date}T${m.time}`);
      return meetingDateTime >= now && m.status === 'Scheduled';
    }).sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    return {
      totalThisMonth: thisMonthMeetings.length,
      upcomingMeetings,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Barangay Meetings</h1>
          <p className="text-sm text-gray-500 font-medium">Schedule and manage community meetings</p>
        </div>
        <MeetingSchedulerForm onSuccess={loadData} />
      </header>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Meetings</p>
              <p className="text-3xl font-black text-gray-900">{stats.totalThisMonth}</p>
              <p className="text-xs text-gray-400">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Upcoming Sessions</p>
              {stats.upcomingMeetings && stats.upcomingMeetings.length > 0 ? (
                <div className="space-y-2">
                  {stats.upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="text-sm">
                      <p className="font-bold text-gray-900">{meeting.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <Calendar className="text-purple-600" size={20} />
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">
            Upcoming Meetings
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading meetings...</p>
          ) : (
            <UpcomingMeetingsTable
              meetings={meetings}
              onMeetingClick={handleMeetingClick}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-start border-b border-purple-600">
              <div>
                <h2 className="text-2xl font-black">{selectedMeeting.title}</h2>
                <p className="text-purple-100 text-sm mt-1">{selectedMeeting.venue}</p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Meeting Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar size={16} />
                    <p className="text-xs font-bold uppercase tracking-widest">Date</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(selectedMeeting.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock size={16} />
                    <p className="text-xs font-bold uppercase tracking-widest">Time</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedMeeting.time}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin size={16} />
                    <p className="text-xs font-bold uppercase tracking-widest">Venue</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedMeeting.venue}</p>
                </div>
              </div>

              {/* Agenda */}
              <div>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                  Agenda
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMeeting.agenda}</p>
                </div>
              </div>

              {/* Attendees */}
              <AttendeeTracker meetingId={selectedMeeting.id} staffList={staffList} />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <MeetingMinutesForm meeting={selectedMeeting} onSuccess={loadData} />
                <ExportMinutesButton
                  meeting={selectedMeeting}
                  attendees={selectedAttendees}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
