// Google Apps Script code
// Copy this code to your Google Apps Script project

function doPost(e) {
  try {
    // Get the spreadsheet and sheet
    const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // Replace with your spreadsheet ID
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Format timestamp
    const timestamp = new Date(data.timestamp);
    
    // Prepare row data
    const rowData = [
      timestamp,
      data.fullName,
      data.mobile,
      data.email,
      data.college,
      data.university,
      data.year,
      data.governorate,
      data.committee,
      data.hasVolunteered,
      data.volunteerHistory
    ];
    
    // Add data to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    console.error('Error processing request:', error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('This endpoint only accepts POST requests');
}

// Add headers to the sheet if it's empty
function setupSheet() {
  const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // Replace with your spreadsheet ID
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    const headers = [
      'التاريخ والوقت',
      'الاسم الرباعي',
      'رقم الموبايل',
      'البريد الإلكتروني',
      'الكلية',
      'الجامعة',
      'السنة الدراسية',
      'المحافظة',
      'اللجنة',
      'هل سبق التطوع',
      'تاريخ التطوع السابق'
    ];
    
    sheet.appendRow(headers);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4a90e2');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidths(1, headers.length, 150);
  }
} 