// src/lib/googleSheets.ts

// 🔁 ضع هنا رابط Google Apps Script الخاص بك بعد النشر (Publish > Deploy > Web App)
const GOOGLE_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbwb0V4pbGRpkFqyzZ_fzO1fCCUi7DFzr2sa8Tz39gdzSMTLYq4519qHY-ga__HDPHJ0/exec';

// شكل البيانات المتوقع إرساله (يمكنك تعديله حسب النموذج)
export interface VolunteerFormData {
  fullName: string;
  mobile: string;
  email: string;
  college: string;
  university: string;
  year: string;
  governorate: string;
  committee: string;
  volunteerHistory: string;
  hasVolunteered: string;
  acceptTerms: boolean;
  timestamp: string;
}

// إرسال البيانات إلى Google Sheets باستخدام Google Apps Script
export async function sendToGoogleSheets(data: VolunteerFormData): Promise<boolean> {
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // 👈 هذا مهم لتجنب مشكلة CORS في المتصفح
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // لا يمكن قراءة الرد عند استخدام no-cors، لذلك نعتبر أنه ناجح
    return true;
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    return false;
  }
} 