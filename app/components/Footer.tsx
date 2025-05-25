import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white/80 backdrop-blur-sm py-8 px-4 mt-16 flex justify-center">
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-6 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/adamasslogo.png" alt="Adamass Logo" width={120} height={28} />
        </div>
        {/* Links */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
          <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
          <span className="hidden md:inline">|</span>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
        </div>
        {/* Newsletter */}
        <form className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Your email"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </footer>
  );
};

export default Footer; 