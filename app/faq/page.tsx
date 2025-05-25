import FaqAccordion from './FaqAccordion'; // Import the new client component

export default function FaqPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-4xl w-full pt-30">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent tracking-tight px-4 mb-10">
            Frequently Asked Questions
          </h1>
        </header>
        <FaqAccordion /> {/* Render the client component */}
      </div>
    </main>
  );
} 