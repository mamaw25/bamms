'use client'

import { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ActionButtonProps {
  type: 'in' | 'out';
  firstName: string;
  onConfirm: () => Promise<void>;
}

export default function ActionButton({ type, firstName, onConfirm }: ActionButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isClockIn = type === 'in';

  const handleAction = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={`w-full font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
          isClockIn 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isClockIn ? 'Check In for Today' : <><Clock size={20} /> Clock Out for Today</>}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Hi {firstName}, are you sure you want to <span className="font-bold text-gray-800">{isClockIn ? 'Clock In' : 'Clock Out'}</span> right now?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition ${
                  isClockIn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}