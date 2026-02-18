'use client';

import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteStaff } from '../action';

interface ActionButtonsProps {
  staffId: string;
  firstName: string;
  lastName: string;
  uniqueId: string;
}

export function StaffActionButtons({ 
  staffId, 
  firstName, 
  lastName, 
  uniqueId 
}: ActionButtonsProps) {
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {
      try {
        await deleteStaff(staffId);
        window.location.reload();
      } catch (error) {
        alert('Failed to delete staff member');
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Link href={`/dashboard/admin/staff/${uniqueId}/edit`}>
        <button 
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
          title="Edit"
        >
          <Edit2 size={18} />
        </button>
      </Link>
      <button 
        onClick={handleDelete}
        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
