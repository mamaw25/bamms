import LeaveRequestFormTemplate from '@/app/dashboard/components/LeaveRequestFormTemplate'

export default function LeaveFormTemplatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Request Form Template</h1>
          <p className="text-gray-600">Download or print a blank leave request form to fill out manually if needed.</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> You can either print this form directly, save it as a Word document (.docx) for editing, or export it as a PDF. Fill out all required fields (*) before submitting.
          </p>
        </div>

        <LeaveRequestFormTemplate />
      </div>
    </div>
  )
}
