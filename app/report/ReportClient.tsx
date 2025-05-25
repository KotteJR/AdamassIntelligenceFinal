"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// import { RevenueGrowthChart, InvestmentHistoryChart, MarketPresenceMap } from './CompanyIntelligenceCharts'; // Charts removed
import StrategicRecommendationItem from './StrategicRecommendationItem';

// Types
interface StoredReport {
  jobId: string;
  companyAlias: string;
  dateGenerated: string;
  companyIntelligence: any;
  architecture: any;
  security: any;
  adamassSynthesisReport?: any;
}

const sectionColors = {
  architecture: 'border-blue-300 bg-blue-50',
  security: 'border-yellow-300 bg-yellow-50',
  intelligence: 'border-purple-300 bg-purple-50',
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-24 mb-20">
    <div className="bg-white">
      <h2 className="text-5xl font-extrabold text-gray-900 mb-10 flex items-center gap-4">
        <span className="inline-block w-2 h-10 bg-blue-500 rounded-full"></span>
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">{title}</span>
      </h2>
      {children}
    </div>
  </section>
);

// New DetailedInfoCard Component
interface DetailedInfoCardProps {
  title: string;
  items?: string[];
  itemClassName?: string;
  analysisTitle?: string;
  analysisText?: string;
  analysisBaseColor?: string;
  children?: React.ReactNode; // For custom content within the card
  gridCols?: string; // e.g., 'md:grid-cols-2' for internal grid layout
}

const DetailedInfoCard: React.FC<DetailedInfoCardProps> = ({
  title,
  items,
  itemClassName = "",
  analysisTitle,
  analysisText,
  analysisBaseColor = "gray",
  children,
  gridCols
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">{title}</h3>
        
        <div className={gridCols ? `grid gap-6 ${gridCols}` : ''}>
          {items && items.length > 0 && (
            <div className={`${gridCols ? 'col-span-1' : ''} ${analysisText && !gridCols ? 'mb-6' : ''}`}>
              <ul className="space-y-3">
                {items.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-3 text-gray-700 ${itemClassName}`}>
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{typeof item === 'string' || typeof item === 'number' ? item : JSON.stringify(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysisText && (
             <div className={`${gridCols && items && items.length > 0 ? 'col-span-1' : ''} ${!gridCols && items && items.length === 0 ? 'mt-0' : gridCols ? 'md:mt-0' : 'mt-4' }`}>
              {analysisTitle && <h4 className={`text-lg font-semibold text-gray-700 mb-2`}>{analysisTitle}</h4>}
              <p className={`text-gray-600 whitespace-pre-line leading-relaxed text-sm`}>{analysisText}</p>
            </div>
          )}

          {children && (items || analysisText ? <div className={gridCols ? 'md:col-span-full mt-4 pt-4 border-t border-gray-200' : 'mt-4 pt-4 border-t border-gray-200'}>{children}</div> : children)}
        </div>
      </div>
    </div>
  );
};

const ReportClient = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [report, setReport] = useState<StoredReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let retrievedJobId: string | null = null;
    if (typeof window !== 'undefined') {
      retrievedJobId = localStorage.getItem('currentJobId');
      setJobId(retrievedJobId);
      if (retrievedJobId) {
        fetch(`/api/reports/${retrievedJobId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => setReport(data))
          .catch(() => setReport(null))
          .finally(() => setIsLoading(false)); // Ensure isLoading is set to false in all paths
      } else {
        setIsLoading(false); // Also set loading to false if no jobId
      }
    } else {
      setIsLoading(false); // Should not happen with "use client" but good practice
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <p className="text-xl text-gray-700">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Report Not Found</h1>
        <p className="text-gray-700 mb-2">No report found for Job ID: <span className='font-mono'>{jobId || 'Unknown'}</span>.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const { 
    companyAlias, 
    dateGenerated, 
    architecture, 
    security, 
    companyIntelligence 
  } = report || {};

  // Helper to render score bars
  const renderScoreBar = (label: string, score: number | undefined, maxScore = 10) => {
    if (typeof score !== 'number') return <div className="mb-4"><span className="text-base text-gray-600">{label}: N/A</span></div>;
    const percentage = (score / maxScore) * 100;
    let bgColor = 'bg-red-500';
    let textColor = 'text-red-600';
    if (percentage >= 70) {
      bgColor = 'bg-green-500';
      textColor = 'text-green-600';
    } else if (percentage >= 40) {
      bgColor = 'bg-yellow-500';
      textColor = 'text-yellow-600';
    }
    return (
      <div className="mb-8">
        <div className="flex justify-between text-base mb-2">
          <span className="font-medium text-gray-700">{label}</span>
          <span className={`font-semibold ${textColor}`}>{score}/{maxScore}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`${bgColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  // Helper for section text
  const SectionText: React.FC<{ data: any }> = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!data || typeof data !== 'object' || data.error) {
      return <p className="text-gray-400 italic text-lg">Data not available or error in processing.</p>;
    }

    const hasExpandableContent = data.text && data.text.length > 300;
    const displayText = hasExpandableContent && !isExpanded ? `${data.text.slice(0, 300)}...` : data.text;

    return (
      <div className="space-y-6">
        {data.highlight && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <p className="text-xl text-blue-800 font-medium">{data.highlight}</p>
          </div>
        )}
        {data.preview && <p className="text-lg text-gray-600 leading-relaxed">{data.preview}</p>}
        {data.text && (
          <div className="relative">
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{displayText}</p>
            {hasExpandableContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
              >
                {isExpanded ? (
                  <>
                    Show Less
                    <svg className="w-5 h-5 transform rotate-180 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Read More
                    <svg className="w-5 h-5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white pt-24">
      {/* Floating Back Button - REMOVED
      <Link href="/" className="fixed top-8 left-8 z-50 px-5 py-2.5 bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Home
      </Link>
      */}
      <div className="max-w-6xl mx-auto py-20 px-8">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {companyAlias}
          </h1>
          <p className="text-xl text-gray-500 mb-2">Comprehensive Analysis Report</p>
          <p className="text-sm text-gray-400">Generated on {new Date(dateGenerated).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </header>

        {/* Score Overview Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {architecture?.overall_score !== undefined && (
              <div className="p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.75M9 12h6.75m-6.75 5.25h6.75M5.25 21v-18a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25v18" />
                  </svg>
                  <h3 className="text-lg font-medium text-blue-700">Architecture Score</h3>
                </div>
                <p className="text-4xl font-bold text-blue-800">{architecture.overall_score}/10</p>
              </div>
            )}
            {security?.overall_score !== undefined && (
              <div className="p-6 bg-gradient-to-br from-sky-50 via-sky-100 to-sky-50 rounded-2xl shadow-lg">
                 <div className="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0 0 18.402 6a11.959 11.959 0 0 1-1.043-.751" />
                  </svg>
                  <h3 className="text-lg font-medium text-sky-700">Security Score</h3>
                </div>
                <p className="text-4xl font-bold text-sky-800">{security.overall_score}/10</p>
              </div>
            )}
            {report?.adamassSynthesisReport?.overall_assessment?.confidence_score !== undefined && (
              <div className="p-6 bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-50 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-cyan-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456Z" />
                  </svg>
                  <h3 className="text-lg font-medium text-cyan-700">Adamass Confidence</h3>
                </div>
                <p className="text-4xl font-bold text-cyan-800">
                  {parseFloat(report.adamassSynthesisReport.overall_assessment.confidence_score).toFixed(1)}/10
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ADAMASS INTELLIGENCE REPORT - MOVED FIRST */}
        {report?.adamassSynthesisReport && (
          <SectionCard title="Adamass Intelligence Report">
            <div className="space-y-8">
              {/* Executive Summary */}
              {report.adamassSynthesisReport.executive_summary && (
                <div> 
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">Executive Summary</h3>
                  <p className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-md leading-relaxed text-lg">
                    {report.adamassSynthesisReport.executive_summary}
                  </p>
                </div>
              )}

              {/* Overall Assessment */}
              {report.adamassSynthesisReport.overall_assessment && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Overall Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Verdict</p>
                        <p className="text-2xl font-bold text-blue-600">{report.adamassSynthesisReport.overall_assessment.verdict}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Confidence Score</p>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold text-blue-600">
                            {parseFloat(report.adamassSynthesisReport.overall_assessment.confidence_score).toFixed(1)}
                          </p>
                          <span className="text-xl text-gray-500 ml-1">/ 10</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Key Rationale</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                         <p className="text-gray-700 leading-relaxed text-sm">{report.adamassSynthesisReport.overall_assessment.key_rationale}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Risks & Mitigation */}
              {report.adamassSynthesisReport.key_risks_and_mitigation && report.adamassSynthesisReport.key_risks_and_mitigation.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Key Risks & Mitigation Strategies</h3>
                  <div className="space-y-4">
                    {report.adamassSynthesisReport.key_risks_and_mitigation.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-md font-semibold text-red-700 flex-grow pr-2">
                            <span className="font-bold">Risk:</span> {item.risk}
                          </h4>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${item.severity === 'High' ? 'bg-red-100 text-red-700' : item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {item.severity} Severity
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-bold">Mitigation:</span> {item.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Synergies */}
              {report.adamassSynthesisReport.potential_synergies && (report.adamassSynthesisReport.potential_synergies.cost_synergies?.length > 0 || report.adamassSynthesisReport.potential_synergies.revenue_synergies?.length > 0) && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Potential Synergies</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Cost Synergies */}
                    {report.adamassSynthesisReport.potential_synergies.cost_synergies && report.adamassSynthesisReport.potential_synergies.cost_synergies.length > 0 && (
                      <div>
                        <h4 className="text-xl font-semibold text-blue-700 mb-3">Cost Synergies</h4>
                        {report.adamassSynthesisReport.potential_synergies.overall_cost_synergy_summary && (
                           <p className="text-sm text-blue-600 mb-3 italic">{report.adamassSynthesisReport.potential_synergies.overall_cost_synergy_summary}</p>
                        )}
                        <div className="space-y-3">
                          {report.adamassSynthesisReport.potential_synergies.cost_synergies.map((synergy: any, index: number) => (
                            <div key={index} className="p-3 rounded-md bg-gray-50">
                              <h5 className="font-medium text-blue-800 text-sm">{synergy.area}</h5>
                              <p className="text-xs text-gray-600 mt-0.5"><strong>Est. Savings:</strong> {synergy.estimated_annual_savings || synergy.estimated_annual_savings_usd}</p>
                              <p className="text-xs text-gray-600"><strong>Timeline:</strong> {synergy.realization_timeline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Revenue Synergies */}
                    {report.adamassSynthesisReport.potential_synergies.revenue_synergies && report.adamassSynthesisReport.potential_synergies.revenue_synergies.length > 0 && (
                      <div>
                        <h4 className="text-xl font-semibold text-green-700 mb-3">Revenue Synergies</h4>
                         {report.adamassSynthesisReport.potential_synergies.overall_revenue_synergy_summary && (
                           <p className="text-sm text-green-600 mb-3 italic">{report.adamassSynthesisReport.potential_synergies.overall_revenue_synergy_summary}</p>
                        )}
                        <div className="space-y-3">
                          {report.adamassSynthesisReport.potential_synergies.revenue_synergies.map((synergy: any, index: number) => (
                            <div key={index} className="p-3 rounded-md bg-gray-50">
                              <h5 className="font-medium text-green-800 text-sm">{synergy.area}</h5>
                              <p className="text-xs text-gray-600 mt-0.5"><strong>Est. Revenue Inc.:</strong> {synergy.estimated_annual_revenue || synergy.estimated_annual_revenue_usd}</p>
                              <p className="text-xs text-gray-600"><strong>Timeline:</strong> {synergy.realization_timeline}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strategic Recommendations */}
              {report.adamassSynthesisReport.strategic_recommendations && report.adamassSynthesisReport.strategic_recommendations.length > 0 && (
                 <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Strategic Recommendations</h3>
                  <div className="space-y-4">
                    {report.adamassSynthesisReport.strategic_recommendations.map((rec: any, index: number) => (
                      <div key={rec.id || index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                         <StrategicRecommendationItem recommendation={rec} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Closing Statement */}
              {report.adamassSynthesisReport.closing_statement && (
                <div> 
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">Closing Statement</h3>
                  <p className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-md leading-relaxed text-lg">
                    {report.adamassSynthesisReport.closing_statement}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ARCHITECTURE SECTION - REMAINS SECOND (effectively) */}
        <SectionCard title="Architecture Analysis">
          {architecture?.error ? (
            <p className="text-red-500 text-lg">Error: {architecture.error}</p>
          ) : architecture ? (
            <div className="space-y-12">
              {/* Scores Section */}
              <div>
                {architecture.subscores && Object.entries(architecture.subscores).map(([key, value]) =>
                  renderScoreBar(key.charAt(0).toUpperCase() + key.slice(1), value as number)
                )}
              </div>

              {/* Badges Section */}
              {architecture.badges && Array.isArray(architecture.badges) && architecture.badges.length > 0 && (
                <div className="flex flex-wrap gap-3 py-4">
                  {architecture.badges.map((badge: any, i: number) => (
                    <span key={i} className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      badge.type === 'positive' ? 'bg-green-50 text-green-700 border border-green-200' : 
                      badge.type === 'negative' ? 'bg-red-50 text-red-700 border border-red-200' : 
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>{badge.label || badge}</span>
                  ))}
                </div>
              )}

              {/* Strengths and Risks Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {architecture.main_good && (
                  <div className="bg-green-50 rounded-2xl p-8">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Key Strengths</h4>
                    <ul className="space-y-3">
                      {architecture.main_good.map((good: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-green-700">
                          <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{good}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {architecture.main_risks && (
                  <div className="bg-red-50 rounded-2xl p-8">
                    <h4 className="text-xl font-semibold text-red-800 mb-4">Key Risks</h4>
                    <ul className="space-y-3">
                      {architecture.main_risks.map((risk: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-red-700">
                          <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Detailed Analysis Section */}
              <div className="space-y-12 pt-8">
                {architecture.summary && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Summary</h3>
                    <SectionText data={architecture.summary} />
                  </div>
                )}
                {architecture.insights && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Key Insights</h3>
                    <SectionText data={architecture.insights} />
                  </div>
                )}
                {architecture.recommendations && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recommendations</h3>
                    <SectionText data={architecture.recommendations} />
                  </div>
                )}
              </div>
            </div>
          ) : <p className="text-gray-400 italic text-lg">No architecture data available.</p>}
        </SectionCard>

        {/* SECURITY SECTION - REMAINS THIRD (effectively) */}
        <SectionCard title="Security Analysis">
          {security?.error ? (
            <p className="text-red-500 text-lg">Error: {security.error}</p>
          ) : security ? (
            <div className="space-y-12">
              {/* Scores Section */}
              <div>
                {security.subscores && Object.entries(security.subscores).map(([key, value]) =>
                  renderScoreBar(key.charAt(0).toUpperCase() + key.slice(1), value as number)
                )}
              </div>

              {/* Badges Section */}
              {security.badges && Array.isArray(security.badges) && security.badges.length > 0 && (
                <div className="flex flex-wrap gap-3 py-4">
                  {security.badges.map((badge: any, i: number) => (
                    <span key={i} className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      badge.type === 'positive' ? 'bg-green-50 text-green-700 border border-green-200' : 
                      badge.type === 'negative' ? 'bg-red-50 text-red-700 border border-red-200' : 
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>{badge.label || badge}</span>
                  ))}
                </div>
              )}

              {/* Strengths and Risks Section for Security - Placed after Badges, before Findings Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-8">
                {security.main_good && Array.isArray(security.main_good) && security.main_good.length > 0 && (
                  <div className="bg-green-50 rounded-2xl p-8">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Key Strengths</h4>
                    <ul className="space-y-3">
                      {security.main_good.map((good: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-green-700">
                          <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{good}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {security.main_risks && Array.isArray(security.main_risks) && security.main_risks.length > 0 && (
                  <div className="bg-red-50 rounded-2xl p-8">
                    <h4 className="text-xl font-semibold text-red-800 mb-4">Key Risks</h4>
                    <ul className="space-y-3">
                      {security.main_risks.map((risk: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-red-700">
                          <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Findings Table */}
              {security.findings && Array.isArray(security.findings) && security.findings.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Security Findings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-separate border-spacing-0">
                      <thead>
                        <tr>
                          {Object.keys(security.findings[0] || {}).map(key => (
                            <th key={key} className="px-6 py-5 text-left font-semibold text-gray-700 border-b border-gray-200 text-lg">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {security.findings.map((finding: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Object.values(finding).map((value: any, j: number) => (
                              <td key={j} className="px-6 py-5 border-b border-gray-100 text-base">
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detailed Analysis Section */}
              <div className="space-y-12 pt-8">
                {security.summary && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Summary</h3>
                    <SectionText data={security.summary} />
                  </div>
                )}
                {security.insights && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Key Insights</h3>
                    <SectionText data={security.insights} />
                  </div>
                )}
                {security.recommendations && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recommendations</h3>
                    <SectionText data={security.recommendations} />
                  </div>
                )}
              </div>
            </div>
          ) : <p className="text-gray-400 italic text-lg">No security data available.</p>}
        </SectionCard>

        {/* COMPANY INTELLIGENCE SECTION - MOVED LAST */}
        <SectionCard title="Company Intelligence">
          {companyIntelligence?.error ? (
            <p className="text-red-500">Error: {companyIntelligence.error}</p>
          ) : companyIntelligence ? (
            <div className="space-y-6">
              {/* Company Overview & Key Info */}
              <DetailedInfoCard title="Company Overview">
                <div className="space-y-6">
                  <div className="space-y-5">
                    <p className="text-gray-600 leading-relaxed text-base">{companyIntelligence.company_overview?.overview || 'No overview available.'}</p>
                    {companyIntelligence.company_overview?.company_mission && (
                      <div className={`p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-md`}>
                        <h4 className={`text-lg font-semibold text-blue-700 mb-2`}>Mission Statement</h4>
                        <p className={`text-blue-600 whitespace-pre-line leading-relaxed text-sm`}>{companyIntelligence.company_overview.company_mission}</p>
                      </div>
                    )}
                  </div>

                  <div>
                     <h4 className="text-lg font-semibold text-gray-700 mb-4">Key Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(['official_company_name', 'industry', 'headquarters', 'founding_date', 'number_of_employees', 'website'] as const).map(key => {
                        const value = companyIntelligence.company_overview?.[key];
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        if (!value) return null;
                        return (
                          <div key={key} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                            <dd className="mt-1 text-sm text-gray-700">
                              {key === 'website' && typeof value === 'string' ? 
                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{value}</a> : 
                              key === 'industry' && typeof value === 'string' ?
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">{value}</span> :
                                String(value)
                              }
                            </dd>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </DetailedInfoCard>

              {/* Core Offerings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <DetailedInfoCard 
                  title="Unique Selling Points" 
                  items={companyIntelligence.company_overview?.unique_selling_points}
                  analysisText={companyIntelligence.company_overview?.unique_selling_points_analysis}
                  analysisTitle="USP Analysis"
                  analysisBaseColor="blue"
                />
                <DetailedInfoCard 
                  title="Products & Services" 
                  items={companyIntelligence.company_overview?.products_services}
                  analysisText={companyIntelligence.company_overview?.products_services_analysis}
                  analysisTitle="Product/Service Analysis"
                  analysisBaseColor="blue"
                />
              </div>
              
              <DetailedInfoCard 
                title="Main Competitors" 
                items={Array.isArray(companyIntelligence.company_overview?.main_competitors) ? companyIntelligence.company_overview.main_competitors : (companyIntelligence.company_overview?.main_competitors ? [companyIntelligence.company_overview.main_competitors] : [])} 
                analysisText={companyIntelligence.company_overview?.main_competitors_analysis}
                analysisTitle="Competitive Landscape"
                analysisBaseColor="blue"
              />
              
              <DetailedInfoCard 
                title="Geographical Presence" 
                analysisText={companyIntelligence.company_overview.locations_analysis}
                analysisTitle="Locations Analysis"
                analysisBaseColor="blue"
              >
                {/* Integrate Map Here - REMOVED */}
                {/* {companyIntelligence.graph_data?.market_presence && companyIntelligence.graph_data.market_presence.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Market Presence Map</h4>
                    <MarketPresenceMap data={companyIntelligence.graph_data.market_presence} />
                  </div>
                )} */}
              </DetailedInfoCard>

              {/* Financials & Metrics */}
              <DetailedInfoCard title="Financials & Metrics">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {(['revenue', 'profit', 'ebitda', 'it_spend', 'web_visits', 'active_website_tech_count'] as const).map(key => {
                    const value = companyIntelligence.financials_metrics?.[key];
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-700">{String(value ?? 'N/A')}</dd>
                      </div>
                    );
                  })}
                </div>
                {companyIntelligence.financials_metrics?.growth_scores && Object.keys(companyIntelligence.financials_metrics.growth_scores).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-slate-700 mb-2">Growth Scores (YoY):</h4>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                      {Object.entries(companyIntelligence.financials_metrics.growth_scores).map(([year, score]) => (
                        <li key={year}>{year}: {String(score)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {companyIntelligence.financials_metrics?.financial_commentary && 
                  <div className={`p-5 bg-green-50 border-l-4 border-green-500 rounded-r-md mb-4`}>
                    <h4 className={`text-lg font-semibold text-green-700 mb-2`}>Financial Commentary</h4>
                    <p className={`text-green-600 whitespace-pre-line leading-relaxed text-sm`}>{companyIntelligence.financials_metrics.financial_commentary}</p>
                  </div>
                }
                {companyIntelligence.financials_metrics?.financial_metrics_analysis && 
                  <div className={`p-5 bg-lime-50 border-l-4 border-lime-500 rounded-r-md`}>
                    <h4 className={`text-lg font-semibold text-lime-700 mb-2`}>Financial Metrics Deep Dive</h4>
                    <p className={`text-lime-600 whitespace-pre-line leading-relaxed text-sm`}>{companyIntelligence.financials_metrics.financial_metrics_analysis}</p>
                  </div>
                }
              </DetailedInfoCard>

              <DetailedInfoCard title="Funding Rounds">
                {companyIntelligence.funding_rounds?.rounds?.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {companyIntelligence.funding_rounds.rounds.map((round: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-blue-700 text-base mb-1">{round.round_name || 'Round'} <span className="text-gray-500 text-xs font-normal">({round.date})</span></h5>
                        <p className="text-gray-600 text-xs">Amount: {round.amount_raised || 'N/A'}</p>
                        <p className="text-gray-600 text-xs">Investors: {round.number_of_investors ?? 'N/A'} {round.lead_investors?.length > 0 ? `(Lead: ${round.lead_investors.join(', ')})` : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 italic mb-6 text-sm">No funding rounds listed.</p>}
                {companyIntelligence.funding_rounds?.total_funding_amount && (
                  <p className="text-gray-700 mb-4 text-sm"><strong>Total Funding:</strong> <span className="font-semibold">{companyIntelligence.funding_rounds.total_funding_amount}</span></p>
                )}
                {companyIntelligence.funding_rounds?.funding_commentary && 
                  <div className={`p-5 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-md mb-4`}>
                     <h4 className={`text-lg font-semibold text-indigo-700 mb-2`}>Funding Commentary</h4>
                     <p className={`text-indigo-700 whitespace-pre-line leading-relaxed text-sm`}>{companyIntelligence.funding_rounds.funding_commentary}</p>
                  </div>
                }
                {companyIntelligence.funding_rounds?.funding_rounds_analysis && 
                  <div className={`p-5 bg-purple-50 border-l-4 border-purple-400 rounded-r-md`}>
                     <h4 className={`text-lg font-semibold text-purple-700 mb-2`}>Detailed Funding Analysis</h4>
                     <p className={`text-purple-700 whitespace-pre-line leading-relaxed text-sm`}>{companyIntelligence.funding_rounds.funding_rounds_analysis}</p>
                  </div>
                }
              </DetailedInfoCard>
              
              <DetailedInfoCard 
                title="Key Investors" 
                items={companyIntelligence.investors?.map((inv: any) => typeof inv === 'string' ? inv : inv.name) || []} 
                itemClassName="text-sm"
              />

              {/* News & Press */}
              <DetailedInfoCard 
                title="Recent News & Press"
                analysisText={companyIntelligence.news_trends}
                analysisTitle="News Trends Analysis"
                analysisBaseColor="blue"
              >
                {companyIntelligence.news_press?.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {companyIntelligence.news_press.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-800 text-base mb-0.5">{item.headline || 'No headline'}</h5>
                        <p className="text-gray-500 text-xs mb-1">{item.date || 'No date'} - {item.publication || 'N/A'}</p>
                        <p className="text-gray-600 text-sm mb-1">{item.summary || 'No summary available'}</p>
                        {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-medium">Read more &rarr;</a>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 italic mt-4 text-sm">No recent news available.</p>}
              </DetailedInfoCard>

              {/* Team & Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <DetailedInfoCard title="People">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 mt-[-10px]">Founders</h4>
                  {companyIntelligence.company_overview?.founders && companyIntelligence.company_overview.founders.length > 0 ? (
                     <ul className="space-y-2 mb-6">
                      {companyIntelligence.company_overview.founders.map((f: any, idx: number) => (
                        <li key={idx} className={`flex items-start gap-2 text-gray-600 text-sm`}>
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                          <span>{typeof f === 'object' && f !== null && 'name' in f ? `${f.name}${f.role ? ` (${f.role})` : ''}` : String(f)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-500 italic text-sm mb-6">No founders listed.</p>}
                  
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Key Team Members</h4>
                   {companyIntelligence.company_overview?.key_team_members && companyIntelligence.company_overview.key_team_members.length > 0 ? (
                    <ul className="space-y-2">
                      {companyIntelligence.company_overview.key_team_members.map((m: any, idx: number) => (
                        <li key={idx} className={`flex items-start gap-2 text-gray-600 text-sm`}>
                           <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                          <span>{typeof m === 'object' && m !== null && 'name' in m ? `${m.name}${m.role ? ` (${m.role})` : ''}` : String(m)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-500 italic text-sm">No key team members listed.</p>}
                </DetailedInfoCard>
                
                <DetailedInfoCard title="Contact Information">
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li><strong>Email:</strong> {companyIntelligence.contact_information?.email || 'N/A'}</li>
                    <li><strong>Phone:</strong> {companyIntelligence.contact_information?.phone || 'N/A'}</li>
                    <li><strong>Address:</strong> {companyIntelligence.contact_information?.address || 'N/A'}</li>
                    {companyIntelligence.contact_information?.other && Object.entries(companyIntelligence.contact_information.other).length > 0 && (
                        Object.entries(companyIntelligence.contact_information.other).map(([key, value]) => (
                            <li key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}</li>
                        ))
                    )}
                  </ul>
                </DetailedInfoCard>
              </div>
            </div>
          ) : <p className="text-gray-400 italic">No company intelligence data available.</p>}
        </SectionCard>
      </div>
    </main>
  );
};

export default ReportClient;