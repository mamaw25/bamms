# Excel Export Feature - Multiple Sheets by Date

## Overview
The attendance export functionality has been enhanced to support Excel file generation with multiple worksheet tabs, each organized by date.

## Features Implemented

### 1. Excel Export with Multiple Sheets
- **Automatic Date Grouping**: Attendance records are automatically grouped by date
- **Separate Worksheets**: Each date gets its own worksheet tab named with the date (MM-DD-YYYY format)
- **Sorted by Date**: Worksheet tabs are sorted chronologically from earliest to latest

### 2. Enhanced Data Formatting
- **Column Headers**: Bold, colored header row with purple background
- **Optimized Column Widths**: Columns are properly sized for readability
- **Additional Information**: Includes duration calculation (hours and minutes)
- **Professional Styling**: Clean, professional appearance suitable for reports

### 3. Data Included in Each Sheet
Each row contains:
- Staff Member Name
- ID Number
- Email Address
- Role
- Clock In Time
- Clock Out Time
- Duration (calculated from check-in/check-out times)
- Status (Completed or On Duty)

### 4. Dual Export Options
- **Export Excel Button**: Creates multi-sheet Excel workbook (green button)
- **Export CSV Button**: Creates single-file CSV format (blue button)

## How to Use

### Export to Excel
1. Go to Admin Panel → Attendance Report
2. Click the **"Export Excel"** button (green)
3. The file will download as `attendance-report-YYYY-MM-DD.xlsx`
4. Open in Microsoft Excel, Google Sheets, or LibreOffice Calc
5. Each date has its own tab at the bottom of the spreadsheet

### Export to CSV
1. Go to Admin Panel → Attendance Report
2. Click the **"Export CSV"** button (blue)
3. The file will download as `attendance-report-MM-DD-YYYY.csv`
4. Open in Excel or any spreadsheet application

## Technical Details

### Dependencies Added
- `xlsx`: Library for generating Excel files
- `@types/xlsx`: TypeScript type definitions

### File Modified
- `app/dashboard/admin/attendance/ExportButton.tsx`

### Key Functions
- `handleExportExcel()`: Creates multi-sheet Excel workbook
- `handleExportCSV()`: Creates CSV export (existing functionality)
- Date grouping and sorting logic ensures organized output

## Example Output
```
File: attendance-report-2026-02-18.xlsx

Tabs in workbook:
- 02-18-2026 (attendance records for that date)
- 02-19-2026 (attendance records for that date)
- 02-20-2026 (attendance records for that date)
...
```

## Browser Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## Notes
- Large attendance records (1000+) may take a moment to process
- Duration calculations only appear when both check-in and check-out times are recorded
- Sheet names are limited to 31 characters (Excel limitation)
