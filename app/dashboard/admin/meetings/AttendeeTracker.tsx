'use client';

import { useState, useEffect, useCallback } from 'react';
import { addMeetingAttendee, removeMeetingAttendee, getMeetingAttendees } from '../action';
import { X, Plus, Users } from 'lucide-react';

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
  profiles: StaffMember | null;
  type?: string;
}

export default function AttendeeTracker({
  meetingId,
  staffList,
}: {
  meetingId: string;
  staffList: StaffMember[];
}) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [error, setError] = useState('');

  const loadAttendees = useCallback(async () => {
    setLoading(true);
    const result = await getMeetingAttendees(meetingId);
    if (result.success) {
      setAttendees(result.data || []);
    }
    setLoading(false);
  }, [meetingId]);

  useEffect(() => {
    (async () => {
      await loadAttendees();
    })();
  }, [loadAttendees]);

  const handleAddAttendee = async () => {
    if (!selectedStaff) return;
    
    const result = await addMeetingAttendee(meetingId, selectedStaff);
    if (result.success) {
      setSelectedStaff('');
      setShowAddForm(false);
      loadAttendees();
    }
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    setError('');
    const result = await removeMeetingAttendee(attendeeId);
    if (result.success) {
      loadAttendees();
    } else {
      setError(result.error || 'Failed to remove attendee');
    }
  };

  const attendeeIds = attendees.map((a) => a.staff_id);
  const availableStaff = staffList.filter((s) => !attendeeIds.includes(s.id));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} className="text-purple-600" />
          Attendees ({attendees.length})
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-purple-100 text-purple-600 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-2">
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select staff member...</option>
              {availableStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name} ({staff.unique_id_number})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddAttendee}
              disabled={!selectedStaff}
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedStaff('');
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold text-xs">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 italic">Loading attendees...</p>
      ) : attendees.length > 0 ? (
        <div className="space-y-2">
          {attendees.map((attendee) => {
            const profile = Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles;
            
            if (!profile) {
              return null;
            }
            
            return (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {profile.unique_id_number}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveAttendee(attendee.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  title="Remove attendee"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic text-center py-4">
          No attendees added yet
        </p>
      )}
    </div>
  );
}
