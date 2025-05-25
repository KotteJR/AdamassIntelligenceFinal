"use client";

import Link from 'next/link';
import Image from 'next/image';

const Header = () => {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-md rounded-4xl border border-gray-200">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/adamasslogo.png" alt="Adamass Logo" width={100} height={24} priority />
        </Link>

        {/* Central Navigation Links - Kept for Home, FAQ, Pricing for wider screens */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</Link>
        </nav>

        {/* Action Buttons & Account Link */}
        <div className="flex items-center space-x-3">
          {/* Always show Pricing link here for consistency, or adjust if needed */}
          {/* For smaller screens, Pricing might be the primary CTA alongside auth buttons */}
          <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg md:hidden">Pricing</Link> 
          
          {/* "Get Started" could also be Sign Up or link to Pricing */}
          <Link href="/" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 