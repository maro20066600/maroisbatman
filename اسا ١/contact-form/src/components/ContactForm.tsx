'use client';

import { useState, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { sendToGoogleSheets } from '@/lib/googleSheets';
import { verifyRecaptcha } from '@/lib/recaptcha';
import type { VolunteerFormData } from '@/lib/googleSheets';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type ReCAPTCHA from 'react-google-recaptcha';

// تحميل ReCAPTCHA فقط في المتصفح
const ReCAPTCHAComponent = dynamic(() => import('react-google-recaptcha'), {
    ssr: false
});

// تعريف اللجان المتاحة
const COMMITTEES = [
    'Public Relations (PR) - العلاقات العامة',
    'Human Resources (HR) - الموارد البشرية',
    'Operations (OR) - العمليات',
    'Social Media (SM) - وسائل التواصل الاجتماعي'
];

// تعريف المحافظات
const GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'البحيرة', 'كفر الشيخ', 'الدقهلية',
    'الغربية', 'المنوفية', 'القليوبية', 'الشرقية', 'بورسعيد', 'الإسماعيلية',
    'السويس', 'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر', 'الفيوم',
    'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
    'الوادي الجديد', 'مطروح'
];

export default function ContactForm() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });

    const [formData, setFormData] = useState<Omit<VolunteerFormData, 'timestamp'>>({
        fullName: '',
        mobile: '',
        email: '',
        college: '',
        university: '',
        year: '',
        governorate: '',
        committee: '',
        volunteerHistory: '',
        hasVolunteered: 'لا',
        acceptTerms: false
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            if (isSubmitting) {
                return;
            }

            setIsSubmitting(true);
            setStatus({ type: 'info', message: 'جاري التحقق من البيانات...' });
            
            if (!formData.acceptTerms) {
                throw new Error('يجب الموافقة على الشروط والأحكام للمتابعة');
            }

            // التحقق من reCAPTCHA
            const token = recaptchaRef.current?.getValue();
            if (!token) {
                throw new Error('يرجى تأكيد أنك لست روبوتاً عبر reCAPTCHA');
            }

            setStatus({ type: 'info', message: 'جاري التحقق من reCAPTCHA...' });
            
            // التحقق من صحة reCAPTCHA
            const isHuman = await verifyRecaptcha(token);
            if (!isHuman) {
                recaptchaRef.current?.reset();
                throw new Error('فشل التحقق من reCAPTCHA. برجاء المحاولة مرة أخرى');
            }

            // التحقق من صحة رقم الموبايل
            const mobileRegex = /^01[0125][0-9]{8}$/;
            if (!mobileRegex.test(formData.mobile)) {
                throw new Error('رقم الموبايل غير صحيح');
            }

            // التحقق من صحة البريد الإلكتروني
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('البريد الإلكتروني غير صحيح');
            }

            setStatus({ type: 'info', message: 'جاري إرسال البيانات...' });

            const submissionData: VolunteerFormData = {
                ...formData,
                timestamp: new Date().toISOString()
            };

            // حفظ في Firebase
            const submissionsRef = ref(database, 'submissions');
            await push(submissionsRef, submissionData);

            // إرسال إلى Google Sheets
            await sendToGoogleSheets(submissionData);

            // توجيه المستخدم إلى صفحة النجاح
            router.push('/success');

        } catch (error: unknown) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.';
            setStatus({ 
                type: 'error', 
                message: errorMessage
            });
            setIsSubmitting(false);
            
            // Reset reCAPTCHA on error
            recaptchaRef.current?.reset();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">استمارة التسجيل</h2>
                
                {/* البيانات الشخصية */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">البيانات الشخصية</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                الاسم رباعي:
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                                placeholder="الاسم رباعي باللغة العربية"
                            />
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                رقم الموبايل:
                            </label>
                            <input
                                type="tel"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                البريد الإلكتروني:
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="governorate" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                المحافظة:
                            </label>
                            <select
                                id="governorate"
                                name="governorate"
                                value={formData.governorate}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            >
                                <option value="">اختر المحافظة</option>
                                {GOVERNORATES.map(gov => (
                                    <option key={gov} value={gov}>{gov}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* البيانات الدراسية */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">البيانات الدراسية</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="college" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                الكلية:
                            </label>
                            <input
                                type="text"
                                id="college"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="university" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                الجامعة:
                            </label>
                            <input
                                type="text"
                                id="university"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                السنة الدراسية:
                            </label>
                            <input
                                type="text"
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* معلومات التطوع */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">معلومات التطوع</h3>
                    
                    <div>
                        <label className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                            اختر اللجنة المفضلة:
                        </label>
                        <select
                            name="committee"
                            value={formData.committee}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        >
                            <option value="">اختر اللجنة</option>
                            {COMMITTEES.map(committee => (
                                <option key={committee} value={committee}>{committee}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                            هل سبق لك التطوع مع وزارة الشباب والرياضة؟
                        </label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="hasVolunteered"
                                    value="نعم"
                                    checked={formData.hasVolunteered === 'نعم'}
                                    onChange={handleChange}
                                    className="ml-2"
                                />
                                <span className="text-gray-700 dark:text-gray-200">نعم</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="hasVolunteered"
                                    value="لا"
                                    checked={formData.hasVolunteered === 'لا'}
                                    onChange={handleChange}
                                    className="ml-2"
                                />
                                <span className="text-gray-700 dark:text-gray-200">لا</span>
                            </label>
                        </div>
                    </div>

                    {formData.hasVolunteered === 'نعم' && (
                        <div>
                            <label htmlFor="volunteerHistory" className="block text-right mb-1 font-medium text-gray-700 dark:text-gray-200">
                                تفاصيل الأنشطة التطوعية السابقة:
                            </label>
                            <textarea
                                id="volunteerHistory"
                                name="volunteerHistory"
                                value={formData.volunteerHistory}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                                rows={4}
                                placeholder="يرجى ذكر تفاصيل الأنشطة التطوعية السابقة مع وزارة الشباب والرياضة"
                            />
                        </div>
                    )}
                </div>

                {/* الشروط والأحكام */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">الشروط والأحكام</h3>
                    
                    <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300 text-sm">
                        <p>بالتسجيل في هذا النموذج، أنت توافق على ما يلي:</p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                            <li>السماح لوزارة الشباب والرياضة باستخدام بياناتك الشخصية للأغراض التطوعية.</li>
                            <li>تلقي رسائل وإشعارات عبر البريد الإلكتروني أو الهاتف المحمول بخصوص الأنشطة التطوعية.</li>
                            <li>الالتزام بقواعد وأنظمة العمل التطوعي في الوزارة.</li>
                            <li>صحة جميع البيانات المقدمة في النموذج.</li>
                        </ul>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
                            />
                            <span className="text-gray-700 dark:text-gray-200">
                                أوافق على الشروط والأحكام المذكورة أعلاه
                            </span>
                        </label>
                    </div>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center my-4">
                    <ReCAPTCHAComponent
                        ref={recaptchaRef}
                        sitekey="6Lf_qH0rAAAAAFEm7QqLUk1neh_nbVtDYFXXhRvA"
                    />
                </div>

                {/* زر الإرسال */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`
                            w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg
                            transition-all duration-200 relative
                            ${isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                            }
                        `}
                    >
                        <span className={`${isSubmitting ? 'invisible' : 'visible'}`}>
                            إرسال
                        </span>
                        {isSubmitting && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </button>
                </div>

                {/* رسالة الحالة */}
                {status.message && (
                    <div className={`
                        text-center p-3 rounded-lg
                        ${status.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : ''}
                        ${status.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : ''}
                        ${status.type === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : ''}
                    `}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}
