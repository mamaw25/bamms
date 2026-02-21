'use client'

import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'

interface LeaveRequest {
  id: string
  staff_id: string
  request_type: string
  start_date: string
  end_date: string
  reason?: string
  status: string
  admin_notes?: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    unique_id_number: string
    email: string
  }
}

export default function LeaveRequestsExportButton({ allRequests }: { allRequests: LeaveRequest[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatRequestType = (type: string) => {
    return type === 'day_off' ? 'Day Off' : type.charAt(0).toUpperCase() + type.slice(1)
  }

  const exportToExcel = async (filter: 'all' | 'approved' | 'rejected' | 'pending') => {
    setIsExporting(true)
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx')

      // Prepare data for each sheet
      const allData = allRequests.map(req => ({
        'Staff Name': req.profiles ? `${req.profiles.first_name} ${req.profiles.last_name}` : 'N/A',
        'ID Number': req.profiles?.unique_id_number || 'N/A',
        'Email': req.profiles?.email || 'N/A',
        'Request Type': formatRequestType(req.request_type),
        'Start Date': formatDate(req.start_date),
        'End Date': formatDate(req.end_date),
        'Reason': req.reason || '-',
        'Status': req.status.charAt(0).toUpperCase() + req.status.slice(1),
        'Admin Notes': req.admin_notes || '-',
        'Submitted': formatDate(req.created_at)
      }))

      const approvedData = allData.filter(d => d.Status === 'Approved')
      const rejectedData = allData.filter(d => d.Status === 'Rejected')
      const pendingData = allData.filter(d => d.Status === 'Pending')

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Add sheets based on filter
      if (filter === 'all') {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(allData),
          'All Requests'
        )
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(approvedData),
          'Approved'
        )
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(rejectedData),
          'Rejected'
        )
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(pendingData),
          'Pending'
        )
      } else if (filter === 'approved') {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(approvedData),
          'Approved Requests'
        )
      } else if (filter === 'rejected') {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(rejectedData),
          'Rejected Requests'
        )
      } else if (filter === 'pending') {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(pendingData),
          'Pending Requests'
        )
      }

      // Generate filename
      const timestamp = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-')
      const filename = `Leave-Requests-${filter}-${timestamp}.xlsx`

      // Write file
      XLSX.writeFile(wb, filename)
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || allRequests.length === 0}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
      >
        <Download size={16} />
        Export
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isExporting && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={() => exportToExcel('all')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700"
          >
            📊 All Requests (4 sheets)
          </button>
          <button
            onClick={() => exportToExcel('approved')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-200 font-medium text-sm text-green-700"
          >
            ✓ Approved Requests
          </button>
          <button
            onClick={() => exportToExcel('rejected')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-200 font-medium text-sm text-red-700"
          >
            ✕ Rejected Requests
          </button>
          <button
            onClick={() => exportToExcel('pending')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 font-medium text-sm text-amber-700"
          >
            ⏳ Pending Requests
          </button>
        </div>
      )}

      {isExporting && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-gray-600 text-center">Exporting...</p>
        </div>
      )}
    </div>
  )
}
