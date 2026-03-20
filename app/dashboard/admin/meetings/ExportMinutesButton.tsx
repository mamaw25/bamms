'use client';

import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMeetingMinutes, getMeetingAttendees } from './action';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
  status: string;
  completed_at?: string | null;
}

interface Attendee {
  id: string;
  staff_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    unique_id_number: string;
    email: string;
    role: string;
  };
  type?: 'manual' | 'auto_checkin';
}

interface MeetingMinutes {
  id: number;
  meeting_id: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function ExportMinutesButton({
  meeting,
  attendees: initialAttendees,
}: {
  meeting: Meeting;
  attendees: Attendee[];
}) {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch minutes
        const minutesResult = await getMeetingMinutes(meeting.id);
        if (minutesResult.success) {
          setMinutes(minutesResult.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [meeting.id]);

  const handleExportPDF = () => {
    const doc = generatePDFContent(meeting, minutes);
    downloadPDF(doc, `meeting-minutes-${meeting.id}.txt`);
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={isLoading}
      className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} /> {isLoading ? 'Loading...' : 'Export Minutes'}
    </button>
  );
}

function generatePDFContent(meeting: Meeting, minutes: MeetingMinutes | null): string {
  const date = new Date(meeting.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format meeting start time with AM/PM
  const [hours, minutes_str] = meeting.time.split(':');
  const startDate = new Date(`2000-01-01T${meeting.time}`);
  const formattedStartTime = startDate.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  });

  const formattedEndTime = meeting.completed_at 
    ? new Date(meeting.completed_at).toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila'
      })
    : 'Not ended yet';

  return `
═══════════════════════════════════════════════════════════════════════════════
                        BARANGAY MEETING MINUTES
═══════════════════════════════════════════════════════════════════════════════

MEETING DETAILS
───────────────────────────────────────────────────────────────────────────────
Meeting Title:    ${meeting.title}
Date:             ${formattedDate}
Started at:       ${formattedStartTime}
Ended at:         ${formattedEndTime}
Venue:            ${meeting.venue}
Status:           ${meeting.status}

AGENDA
───────────────────────────────────────────────────────────────────────────────
${meeting.agenda}

MEETING NOTES
───────────────────────────────────────────────────────────────────────────────
${minutes?.notes || '(Space for meeting notes and discussions)'}

═══════════════════════════════════════════════════════════════════════════════
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════════════════════════
  `;
}

function downloadPDF(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
