'use client'

import { Download, Printer, FileText } from 'lucide-react'
import { useRef } from 'react'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, BorderStyle, WidthType, AlignmentType, VerticalAlign } from 'docx'

export default function LeaveRequestFormTemplate() {
  const formRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (formRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Leave Request Form</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
                .form-container { max-width: 800px; margin: 0 auto; }
                @media print { body { padding: 0; } .no-print { display: none; } }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                .header h1 { margin: 0; font-size: 20px; }
                .section-title { font-weight: bold; font-size: 11px; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #999; padding-bottom: 5px; }
                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
                .field-row.full { grid-template-columns: 1fr; }
                .field-row.triple { grid-template-columns: 1fr 1fr 1fr; }
                .field { display: flex; flex-direction: column; }
                .field label { font-weight: bold; font-size: 10px; margin-bottom: 3px; text-transform: uppercase; }
                .field-input { border: 1px solid #999; min-height: 20px; padding: 5px; font-size: 11px; }
                .field-input.tall { min-height: 60px; }
                .checkbox-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 11px; }
                .checkbox { width: 14px; height: 14px; border: 1px solid #999; }
                .signature-section { margin-top: 30px; }
                .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .sig-box { display: flex; flex-direction: column; }
                .sig-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px; }
                .sig-label { font-size: 10px; }
              </style>
            </head>
            <body>
              <div class="form-container">
                <div class="header">
                  <h1>LEAVE REQUEST FORM</h1>
                  <p style="margin: 5px 0; font-size: 10px; color: #666;">Please fill out all required fields and submit to your supervisor</p>
                </div>

                <div class="section-title">Employee Information</div>
                <div class="field-row">
                  <div class="field"><label>Full Name *</label><div class="field-input"></div></div>
                  <div class="field"><label>ID Number *</label><div class="field-input"></div></div>
                </div>
                <div class="field-row">
                  <div class="field"><label>Email *</label><div class="field-input"></div></div>
                  <div class="field"><label>Date of Request *</label><div class="field-input"></div></div>
                </div>

                <div class="section-title">Leave Details</div>
                <div class="field-row full">
                  <div class="field">
                    <label>Request Type *</label>
                    <div class="checkbox-group">
                      <div class="checkbox-item"><div class="checkbox"></div><span>Sick Leave</span></div>
                      <div class="checkbox-item"><div class="checkbox"></div><span>Maternity Leave</span></div>
                      <div class="checkbox-item"><div class="checkbox"></div><span>Paternity Leave</span></div>
                      <div class="checkbox-item"><div class="checkbox"></div><span>Other</span></div>
                    </div>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field"><label>Start Date *</label><div class="field-input"></div></div>
                  <div class="field"><label>End Date *</label><div class="field-input"></div></div>
                </div>
                <div class="field-row full">
                  <div class="field"><label>Number of Days *</label><div class="field-input"></div></div>
                </div>

                <div style="margin-top: 15px;">
                  <div class="field"><label>Reason for Leave *</label><div class="field-input tall"></div></div>
                </div>

                <div class="signature-section">
                  <div class="section-title">Approvals</div>
                  <div class="signature-row">
                    <div class="sig-box">
                      <label style="font-size: 10px; margin-bottom: 8px;">Employee Signature:</label>
                      <div class="sig-line"></div>
                      <div class="sig-label">Date: _______________</div>
                    </div>
                    <div class="sig-box">
                      <label style="font-size: 10px; margin-bottom: 8px;">Supervisor/Admin Approval:</label>
                      <div class="sig-line"></div>
                      <div class="sig-label">Date: _______________</div>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #999; text-align: center; font-size: 9px; color: #666;">
                  <p>This form must be submitted before the leave period begins</p>
                  <p>For questions, contact HR department</p>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
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
              text: 'Request Type *',
              spacing: { after: 50 },
              bold: true
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
              text: 'Reason for Leave *',
              spacing: { after: 50 },
              bold: true
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
          Print Form
        </button>
        <button
          onClick={handleDownloadWord}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
        >
          <Download size={16} />
          Download (.docx)
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
        >
          <FileText size={16} />
          Export as PDF
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

