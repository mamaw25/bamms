'use client';

import { useState, useEffect } from 'react';
import { updateMeeting, deleteMeeting } from './action';
import { Trash2, Eye, AlertCircle } from 'lucide-react';

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

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100' },
  Completed: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-600', badge: 'bg-red-100' },
};

export default function UpcomingMeetingsTable({
  meetings,
  onMeetingClick,
  onRefresh,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  onRefresh: () => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localMeetings, setLocalMeetings] = useState<Meeting[]>(meetings);

  useEffect(() => {
    setLocalMeetings(meetings);
  }, [meetings]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateMeeting(id, { status: newStatus });
    if (result.success) {
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setDeleting(id);
      setError(null);
      try {
        console.log('Deleting meeting:', id);
        const result = await deleteMeeting(id);
        console.log('Delete result:', result);
        
        if (result.success) {
          console.log('Delete successful');
          setDeleting(null);
          
          // Immediately remove from local state for instant UI feedback
          setLocalMeetings(prev => prev.filter(m => m.id !== id));
          
          // Wait a moment for the server to process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force refresh the data from server
          console.log('Calling onRefresh...');
          onRefresh();
        } else {
          setError(result.error || 'Failed to delete meeting');
          setDeleting(null);
        }
      } catch (err) {
        console.error('Delete error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while deleting');
        setDeleting(null);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600 font-semibold text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700 font-bold text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Meeting Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Venue</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {localMeetings.length > 0 ? (
              localMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{meeting.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {formatDate(meeting.date)} at {meeting.time}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{meeting.venue}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={meeting.status}
                      onChange={(e) => handleStatusChange(meeting.id, e.target.value)}
                      className={`text-xs font-bold rounded-lg px-3 py-1.5 border-0 cursor-pointer ${statusColors[meeting.status].badge} ${statusColors[meeting.status].text} uppercase tracking-widest`}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onMeetingClick(meeting)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        disabled={deleting === meeting.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete meeting"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                  No meetings scheduled yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
