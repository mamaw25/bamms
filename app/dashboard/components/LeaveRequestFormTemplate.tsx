'use client'

import { Download, Printer } from 'lucide-react'
import { useRef } from 'react'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, BorderStyle, WidthType, AlignmentType, VerticalAlign } from 'docx'

export default function LeaveRequestFormTemplate() {
  const formRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (formRef.current) {
      // Create a new window with the form content, preserving all styles
      const printWindow = window.open('', '', 'width=900,height=600')
      if (printWindow) {
        const formElement = formRef.current
        const formHTML = formElement.innerHTML
        
        const styles = `
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.5; }
            @page { margin: 0.5in; size: 8.5in 11in; }
            @media print { 
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
            
            /* Tailwind print utilities */
            .w-full { width: 100%; }
            .bg-white { background-color: white; }
            .p-12 { padding: 3rem; }
            .border { border: 1px solid; }
            .border-gray-300 { border-color: rgb(209, 213, 219); }
            .rounded-lg { border-radius: 0.5rem; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .text-center { text-align: center; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-b { border-bottom-width: 1px; }
            .border-gray-800 { border-color: rgb(31, 41, 55); }
            .border-gray-300 { border-color: rgb(209, 213, 219); }
            .border-gray-400 { border-color: rgb(156, 163, 175); }
            .text-2xl { font-size: 1.5rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .font-bold { font-weight: bold; }
            .text-gray-900 { color: rgb(17, 24, 39); }
            .text-gray-600 { color: rgb(75, 85, 99); }
            .text-gray-700 { color: rgb(55, 65, 81); }
            .text-gray-500 { color: rgb(107, 114, 128); }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .mt-10 { margin-top: 2.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .pt-4 { padding-top: 1rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .min-h-8 { min-height: 2rem; }
            .min-h-24 { min-height: 6rem; }
            .h-12 { height: 3rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-8 { gap: 2rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .gap-2 { gap: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
          </style>
        `
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Leave Request Form</title>
              ${styles}
            </head>
            <body>
              <div style="width: 8.5in; margin: 0 auto; padding: 20px;">
                ${formHTML}
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        
        // Trigger print after content loads
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
        }, 500)
      }
    }
  }

  const handleDownloadWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            // Header
            new Paragraph({
              children: [new TextRun({ text: 'LEAVE REQUEST FORM', size: 48, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              thematicBreak: true
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Please fill out all required fields and submit to your supervisor', size: 40 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            // Employee Information Section
            new Paragraph({
              children: [new TextRun({ text: 'EMPLOYEE INFORMATION', size: 44, bold: true })],
              spacing: { before: 100, after: 100 },
              border: {
                bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 }
              }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('Full Name *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('ID Number *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                }),
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                })
              ]
            }),

            new Paragraph({
              text: '',
              spacing: { after: 100 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('Email *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('Date of Request *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                }),
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                })
              ]
            }),

            // Leave Details Section
            new Paragraph({
              children: [new TextRun({ text: 'LEAVE DETAILS', size: 44, bold: true })],
              spacing: { before: 200, after: 100 },
              border: {
                bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 }
              }
            }),

            new Paragraph({
              children: [new TextRun({ text: 'Request Type *', bold: true })],
              spacing: { after: 50 }
            }),

            new Paragraph({
              text: '☐ Sick Leave              ☐ Maternity Leave              ☐ Paternity Leave              ☐ Other',
              spacing: { after: 150 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('Start Date *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('End Date *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                }),
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    }),
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                })
              ]
            }),

            new Paragraph({
              text: '',
              spacing: { after: 100 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('Number of Days *')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                }),
                new TableRow({
                  height: { value: 400, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                })
              ]
            }),

            new Paragraph({
              text: '',
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [new TextRun({ text: 'Reason for Leave *', bold: true })],
              spacing: { after: 50 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  height: { value: 800, rule: 'auto' },
                  children: [
                    new TableCell({
                      children: [new Paragraph('')],
                      borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }
                    })
                  ]
                })
              ]
            }),

            // Signatures Section
            new Paragraph({
              children: [new TextRun({ text: 'APPROVALS', size: 44, bold: true })],
              spacing: { before: 200, after: 100 },
              border: {
                bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 }
              }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph('Employee Signature:'),
                        new Paragraph({
                          text: '',
                          spacing: { after: 200 }
                        }),
                        new Paragraph({
                          text: 'Date: _____________________',
                          spacing: { before: 50 }
                        })
                      ],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                    }),
                    new TableCell({
                      children: [
                        new Paragraph('Supervisor/Admin Approval:'),
                        new Paragraph({
                          text: '',
                          spacing: { after: 200 }
                        }),
                        new Paragraph({
                          text: 'Date: _____________________',
                          spacing: { before: 50 }
                        })
                      ],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                    })
                  ]
                })
              ]
            }),

            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),

            new Paragraph({
              text: 'This form must be submitted before the leave period begins.',
              alignment: AlignmentType.CENTER,
              spacing: { before: 100 }
            }),

            new Paragraph({
              text: 'For questions, contact HR department',
              alignment: AlignmentType.CENTER
            })
          ]
        }
      ]
    })

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Leave-Request-Form-Template.docx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }


  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
        <button
          onClick={handleDownloadWord}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
        >
          <Download size={16} />
          Download (.docx)
        </button>
      </div>

      {/* Form Template - for print preview */}
      <div
        ref={formRef}
        className="bg-white p-12 border border-gray-300 rounded-lg shadow-sm"
        style={{ width: '8.5in', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="text-center mb-8 pb-4 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">LEAVE REQUEST FORM</h1>
          <p className="text-xs text-gray-600">Please fill out all required fields and submit to your supervisor</p>
        </div>

        {/* Employee Information */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4 pb-2 border-b border-gray-300">
            Employee Information
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                ID Number <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                Date of Request <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
          </div>
        </div>

        {/* Leave Details */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4 pb-2 border-b border-gray-300">
            Leave Details
          </h3>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
              Request Type <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-400"></div>
                <span className="text-sm text-gray-700">Sick Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-400"></div>
                <span className="text-sm text-gray-700">Maternity Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-400"></div>
                <span className="text-sm text-gray-700">Paternity Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-400"></div>
                <span className="text-sm text-gray-700">Other</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                Start Date <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
                End Date <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
              Number of Days <span className="text-red-600">*</span>
            </label>
            <div className="border border-gray-400 px-3 py-2 min-h-8 text-sm"></div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">
            Reason for Leave <span className="text-red-600">*</span>
          </label>
          <div className="border border-gray-400 px-3 py-2 min-h-24 text-sm align-top"></div>
        </div>

        {/* Signatures */}
        <div className="mt-10">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4 pb-2 border-b border-gray-300">
            Approvals
          </h3>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-600 mb-8">Employee Signature:</p>
              <div className="border-b border-gray-400 h-12"></div>
              <p className="text-xs text-gray-500 mt-1">Date: _______________</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-8">Supervisor/Admin Approval:</p>
              <div className="border-b border-gray-400 h-12"></div>
              <p className="text-xs text-gray-500 mt-1">Date: _______________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
          <p>This form must be submitted before the leave period begins</p>
          <p className="mt-1">For questions, contact HR department</p>
        </div>
      </div>
    </div>
  )
}

