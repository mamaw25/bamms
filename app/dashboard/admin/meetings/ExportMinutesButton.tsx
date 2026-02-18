'use client';

import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMeetingMinutes } from './action';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
  status: string;
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
  attendees,
}: {
  meeting: Meeting;
  attendees: Attendee[];
}) {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMinutes = async () => {
      setIsLoading(true);
      const result = await getMeetingMinutes(meeting.id);
      if (result.success) {
        setMinutes(result.data);
      }
      setIsLoading(false);
    };

    fetchMinutes();
  }, [meeting.id]);

  const handleExportPDF = () => {
    const doc = generatePDFContent(meeting, attendees, minutes);
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

function generatePDFContent(meeting: Meeting, attendees: Attendee[], minutes: MeetingMinutes | null): string {
  const date = new Date(meeting.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const attendeesList = attendees
    .map((a) => `• ${a.profiles.first_name} ${a.profiles.last_name} (${a.profiles.unique_id_number})`)
    .join('\n');

  return `
═══════════════════════════════════════════════════════════════════════════════
                        BARANGAY MEETING MINUTES
═══════════════════════════════════════════════════════════════════════════════

MEETING DETAILS
───────────────────────────────────────────────────────────────────────────────
Meeting Title:    ${meeting.title}
Date:             ${formattedDate}
Time:             ${meeting.time}
Venue:            ${meeting.venue}
Status:           ${meeting.status}

AGENDA
───────────────────────────────────────────────────────────────────────────────
${meeting.agenda}

ATTENDEES
───────────────────────────────────────────────────────────────────────────────
${attendeesList || 'No attendees recorded'}

MEETING NOTES
───────────────────────────────────────────────────────────────────────────────
${minutes?.notes || '(Space for meeting notes and discussions)'}




NEXT MEETING
───────────────────────────────────────────────────────────────────────────────
Date: ________________
Time: ________________
Venue: ________________

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
