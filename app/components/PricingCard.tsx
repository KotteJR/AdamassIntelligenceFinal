"use client"; // May not be strictly needed if no client hooks, but good for CTA later

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react'; // For feature checkmarks

interface PricingCardProps {
  planName: string;
  price: string;
  currency?: string;
  frequency?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  label?: string;
  isPopular?: boolean;
  footnote?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  planName,
  price,
  currency = "€",
  frequency = "/ month",
  description,
  features,
  ctaText,
  ctaLink,
  label,
  isPopular = false,
  footnote,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border p-5 md:p-6 flex flex-col ${isPopular ? 'border-blue-500 border-2 pt-8' : 'border-gray-200'} relative`}
    >
      {isPopular && label && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-500 text-white animate-bounce shadow-lg">
            {label}
          </span>
        </div>
      )}
      {!isPopular && label && (
         <div className="mb-3 text-center">
          <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700">
            {label}
          </span>
        </div>
      )}
      <h3 className="text-5xl font-semibold bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 ">{planName}</h3>
      <p className="text-gray-600 min-h-[30px] mb-4 text-sm font-light">{description}</p>
      
      <div className="mb-4 text-left">
        <span className="text-3xl font-bold text-gray-800">{price}</span>
        {planName !== "Basic" && (
            <span className="text-xl text-gray-500">{currency}{frequency}</span>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className={`w-full block text-center px-6 py-3 font-medium rounded-lg transition-colors duration-150 ease-in-out 
          ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300'}
           focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        {ctaText}
      </Link>
      {footnote && (
        <p className="text-xs text-gray-400 text-center mt-4">{footnote}</p>
      )}
    </div>
  );
};

export default PricingCard; 