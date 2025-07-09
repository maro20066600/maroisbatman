import ContactForm from '@/components/ContactForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-4">
            متطوعي وزارة الشباب والرياضة YLY
          </h1>
          <div className="relative">
            <p className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 transform hover:scale-105 transition-all duration-300 ease-in-out animate-fadeIn">
              انضم إلينا
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
