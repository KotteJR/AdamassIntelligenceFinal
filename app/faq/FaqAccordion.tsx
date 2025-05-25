"use client";

import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

// FAQ data can be defined here or passed as props if it becomes dynamic
const faqData = [
  {
    question: "What is Adamass AI?",
    answer: "Adamass AI is a tool that generates comprehensive desktop review reports for companies, with a technological focus. These reports cover aspects like company intelligence, technological architecture, security posture, and more.",
  },
  {
    question: "How do I generate a report?",
    answer: "On the main page, fill in the company\'s alias (common name) and website URL. It is important that you add the legal alias and country of incorporation as it helps improve the accuracy of the report. Then, click \"Generate Report\" and wait for the report to be generated, please do not close, reload or navigate through the page until the report is generated. You can minimize the page and continue with your day, the report will be generated in the background.",
  },
  {
    question: "How long does it take to generate a report?",
    answer: "The process involves gathering data from multiple sources and then applying our AI model for interpretation, analysis and synthesis. This can take several minutes. You can monitor the progress in the \"Process Log\" on the main page. A report is usually finished in less than 5 minutes.",
  },
  {
    question: "What kind of information is included in the report?",
    answer: "The report includes an \"Adamass Intelligence Report\" (with executive summary, overall assessment, risks, synergies, recommendations), \"Architecture Analysis\" (scores, strengths, risks, insights), \"Security Analysis\" (scores, strengths, risks, findings), and \"Company Intelligence\" (overview, financials, funding, news). With more coming on the way.",
  },
  {
    question: "What input data is required to start an analysis?",
    answer: "The minimum required information is the Company Alias (e.g., the common brand name), the company\'s main Website URL and its Legal Name. Country of Incorporation is optional but can help improve accuracy.",
  },
  {
    question: "How is the data for the report sourced?",
    answer: "Adamass AI triggers an analysis workflow that gathers data from various public and proprietary data sources. The specifics of these sources are part of our internal methodology.",
  },
  {
    question: "Can I see reports I\'ve generated previously?",
    answer: "Yes, on the main page, there\'s a \"Previously Analyzed Companies\" section where you can search for and access reports you\'ve generated before and that others have generated as well. We aim to be as transparent as possible.",
  },
  {
    question: "What do the scores in the report (Architecture, Security, Adamass Confidence) mean?",
    answer: "These scores (typically out of 10) provide a quantitative assessment of the company\'s standing in each respective area. Higher scores indicate better performance or higher confidence in the analysis. Detailed breakdowns and rationale are provided within each section. The Adamass Confidence score is a score given by the Adamass AI model to the overall report, it is a score out of 10 that indicates the confidence we have in this firm, and the verdict of the report.",
  },
  {
    question: "Is my data and the generated report secure?",
    answer: "We take data security seriously. Input data is used solely for report generation, and reports are stored securely. Please refer to our Privacy Policy for more details.", // Placeholder - update with actual info
  },
  {
    question: "What if the report generation fails or I encounter an error?",
    answer: "The \"Process Log\" on the main page will display any errors encountered. If a report fails, you can try again, ensuring the input details are correct. If issues persist, please contact our support.", // Placeholder - update with actual info
  },
];

const FaqItem = ({ item, isOpen, onClick }: { item: { question: string; answer: string }; isOpen: boolean; onClick: () => void }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onClick}
        className="flex justify-between items-center w-full py-5 px-6 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ease-in-out"
      >
        <span className="text-lg font-medium text-gray-700">{item.question}</span>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pt-3 pb-6 px-6 leading-relaxed bg-white">
          <p className="whitespace-pre-line text-base font-light text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {faqData.map((item, index) => (
        <FaqItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onClick={() => handleItemClick(index)}
        />
      ))}
    </div>
  );
} 