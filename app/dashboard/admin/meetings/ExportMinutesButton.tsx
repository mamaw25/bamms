'use client';

import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, PageBreak, AlignmentType } from 'docx';
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

  const handleExportPDF = async () => {
    try {
      const doc = generateDocxContent(meeting, minutes);
      await Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meeting-minutes-${meeting.id}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting document:', error);
      alert('Failed to export meeting minutes');
    }
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

function generateDocxContent(meeting: Meeting, minutes: MeetingMinutes | null): Document {
  const date = new Date(meeting.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format meeting start time with AM/PM
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

  const doc = new Document({
    sections: [{
      children: [
        // Title
        new Paragraph({
          children: [new TextRun({
            text: 'BARANGAY MEETING MINUTES',
            bold: true,
            size: 56
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Meeting Details Section
        new Paragraph({
          children: [new TextRun({
            text: 'MEETING DETAILS',
            bold: true,
            size: 48
          })],
          spacing: { before: 200, after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Meeting Title:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: meeting.title })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: formattedDate })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Started at:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: formattedStartTime })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ended at:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: formattedEndTime })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Venue:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: meeting.venue })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status:', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: meeting.status })] })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        // Agenda Section
        new Paragraph({
          children: [new TextRun({
            text: 'AGENDA',
            bold: true,
            size: 48
          })],
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: meeting.agenda || '(No agenda provided)',
          spacing: { after: 400 }
        }),

        // Meeting Notes Section
        new Paragraph({
          children: [new TextRun({
            text: 'MEETING NOTES',
            bold: true,
            size: 48
          })],
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: minutes?.notes || '(Space for meeting notes and discussions)',
          spacing: { after: 400 }
        }),

        new Paragraph({ text: '', spacing: { after: 200 } }),

        // Footer
        new Paragraph({
          children: [new TextRun({
            text: `Generated: ${new Date().toLocaleString()}`,
            italics: true,
            size: 36
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 }
        })
      ]
    }]
  });

  return doc;
}
