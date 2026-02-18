'use client';

import { useState, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { saveMeetingMinutes } from './action';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: string;
}

interface MeetingMinutesFormProps {
  meeting: Meeting;
  onSuccess: () => void;
}

export default function MeetingMinutesForm({
  meeting,
  onSuccess,
}: MeetingMinutesFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await saveMeetingMinutes(meeting.id, notesContent);

      if (result.success) {
        // Reset form
        setNotesContent('');
        setIsOpen(false);
        onSuccess();
        alert('Meeting minutes saved successfully!');
      } else {
        setError(result.error || 'Failed to save meeting minutes');
      }
    } catch (err) {
      console.error('Error saving minutes:', err);
      setError('An error occurred while saving meeting minutes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
      >
        <FileText size={16} /> Add Minutes
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Meeting Minutes</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setNotesContent('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                {/* Meeting Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Meeting</p>
                    <p className="text-lg font-bold text-gray-900">{meeting.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(meeting.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Meeting Notes Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    MEETING NOTES
                  </label>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    placeholder="Enter meeting notes and discussions..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Provide detailed notes from the meeting discussion
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError('');
                    setNotesContent('');
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !notesContent.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Minutes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
