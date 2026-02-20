'use client';

import { FormEvent, useState, useRef } from 'react';
import { createMeeting } from '../action';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';

export default function MeetingSchedulerForm({ onSuccess }: { onSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      venue: formData.get('venue') as string,
      agenda: formData.get('agenda') as string,
    };

    // Validation
    if (!data.title || !data.date || !data.time || !data.venue || !data.agenda) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const result = await createMeeting(data);
    
    if (result.success) {
      setSuccess(true);
      if (formRef.current) {
        formRef.current.reset();
      }
      setTimeout(() => {
        setIsOpen(false);
        onSuccess();
        setSuccess(false);
      }, 2000);
    } else {
      setError(result.error || 'Failed to create meeting');
    }
    
    setLoading(false);
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
        >
          <Plus size={16} /> Schedule Meeting
        </button>
      ) : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Schedule New Meeting</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-600 font-semibold text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-green-600 font-semibold text-sm">Meeting scheduled successfully!</p>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Meeting Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Monthly Barangay Assembly"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Venue</label>
                <select
                  name="venue"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  required
                >
                  <option value="">Select a venue</option>
                  <option value="Barangay Hall">Barangay Hall</option>
                  <option value="Covered Court">Covered Court</option>
                  <option value="Community Center">Community Center</option>
                  <option value="Multipurpose Gym">Multipurpose Gym</option>
                  <option value="Open Field">Open Field</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Agenda</label>
                <textarea
                  name="agenda"
                  placeholder="List the main topics to be discussed..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
