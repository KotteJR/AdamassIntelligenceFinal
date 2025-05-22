"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight, Copy, Plus, RotateCw, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Define types for our data
interface StoredReport {
  jobId: string;
  companyAlias: string;
  dateGenerated: string;
  reportData: any; // This will be the comprehensive report object from /api/process-report-data
}

const LOCAL_STORAGE_REPORTS_KEY = 'companyAnalysisReports';

// LocalStorage utility functions
const saveReportToLocalStorage = (report: StoredReport) => {
  console.log("Attempting to save report for job ID:", report.jobId);
  try {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingReports = getReportsFromLocalStorage();
      // Remove any existing report with the same jobId to avoid duplicates, then add the new one
      const updatedReports = [...existingReports.filter(r => r.jobId !== report.jobId), report];
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updatedReports));
      console.log("Report saved to localStorage");
    } else {
      console.warn("localStorage is not available. Report not saved.");
    }
  } catch (error) {
    console.error("Error saving report to localStorage:", error);
  }
};

const getReportsFromLocalStorage = (): StoredReport[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const reportsJson = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
      return reportsJson ? JSON.parse(reportsJson) : [];
    }
    return [];
  } catch (error) {
    console.error("Error getting reports from localStorage:", error);
    return [];
  }
};

// InputField component defined outside Hero
const InputField = ({ id, label, value, onChange, placeholder, type = "text", disabled }: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      disabled={disabled}
    />
  </div>
);

const Hero = () => {
  const router = useRouter();

  const [companyAlias, setCompanyAlias] = useState('');
  const [legalAlias, setLegalAlias] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [countryOfIncorporation, setCountryOfIncorporation] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  
  const [lastSuccessfulJobId, setLastSuccessfulJobId] = useState<string | null>(null);
  const [isReportReadyForAccess, setIsReportReadyForAccess] = useState(false);

  // State for previously analyzed reports
  const [storedReports, setStoredReports] = useState<StoredReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Add state for selected company
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null);

  const addTerminalMessage = (message: string, type: 'info' | 'error' | 'success' | 'system' = 'info') => {
    let prefix = '> ';
    if (type === 'error') prefix = '❌ ';
    if (type === 'success') prefix = '✅ ';
    if (type === 'system') prefix = '⚙️ ';
    setTerminalOutput((prevOutput) => [...prevOutput, `${prefix}${message}`]);
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput, generationStep, reportError]);

  const resetProcessState = (keepMessages = false) => {
    setIsGenerating(false);
    setCurrentJobId(null);
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    setPollingIntervalId(null);
    if (!keepMessages) {
        // Optionally clear messages, or let them persist for user context
        // setGenerationStep(null);
        // setReportError(null);
    }
  };

  const handleGenerateReport = async () => {
    if (!companyAlias || !websiteUrl) {
      addTerminalMessage('Company Alias and Website URL are required.', 'error');
      setReportError('Company Alias and Website URL are required.');
      return;
    }

    setIsGenerating(true);
    setReportError(null);
    setIsReportReadyForAccess(false);
    setLastSuccessfulJobId(null);
    const newJobId = uuidv4(); // Generate a new jobId each time
    setCurrentJobId(newJobId);
    setTerminalOutput([`> Initializing report for ${companyAlias} (Job ID: ${newJobId})`]);
    setGenerationStep('Initiating analysis...');

    // Clear any old polling interval
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }

    try {
      addTerminalMessage(`Triggering analysis workflow (Job ID: ${newJobId})...`, 'system');
      const initResponse = await fetch('/api/initiate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyAlias, legalAlias, websiteUrl, countryOfIncorporation, jobId: newJobId }),
      });
      const initData = await initResponse.json();

      if (!initResponse.ok) {
        throw new Error(initData.details || initData.error || 'Failed to initiate analysis workflow.');
      }
      addTerminalMessage('Analysis workflow triggered. Waiting for data sources... (This may take several minutes)', 'success');
      setGenerationStep('Waiting for data sources (0/X)... This may take several minutes.');

      // Start polling for job status
      const intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/check-job-status?jobId=${newJobId}`);
          const statusData = await statusResponse.json();

          if (!statusResponse.ok) {
            addTerminalMessage(`Warning: Error checking job status: ${statusData.details || statusData.error}. Will retry.`, 'error');
            return;
          }

          const completedSources = Object.values(statusData.sourceStatuses || {}).filter(s => s === 'done' || s === 'completed').length;
          const totalExpectedSources = statusData.sourceStatuses ? Object.keys(statusData.sourceStatuses).length : 0;

          addTerminalMessage(`Status: ${completedSources}/${totalExpectedSources} data sources ready.`, 'info');
          setGenerationStep(`Waiting for data sources (${completedSources}/${totalExpectedSources})... This may take several minutes.`);

          if (statusData.isComplete) {
            clearInterval(intervalId);
            setPollingIntervalId(null);
            addTerminalMessage('All data sources gathered! Processing with Adamass AI... (This may also take a minute)', 'success');
            setGenerationStep('All data sources gathered. Structuring report with Adamass AI...');

            const processResponse = await fetch('/api/process-report-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobId: newJobId }),
            });
            const reportResult = await processResponse.json();

            if (!processResponse.ok) {
              throw new Error(reportResult.details || reportResult.error || 'Failed to process data and generate report.');
            }

            addTerminalMessage('Report successfully generated and structured!', 'success');
            setGenerationStep('Report complete! You can now access it.');

            // Construct the report object to be saved with a flat structure
            const finalReportToSave = {
              jobId: newJobId, // Overwrites if present in reportResult, which is fine
              companyAlias: companyAlias,
              dateGenerated: new Date().toISOString(), // Overwrites if present in reportResult
              ...reportResult // Spreads architecture, security, companyIntelligence
            };

            // Save the report to the server-side Storage folder
            await fetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalReportToSave),
            });

            setLastSuccessfulJobId(newJobId);
            setIsReportReadyForAccess(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentJobId', newJobId);
            }
            setIsGenerating(false);
          }
        } catch (pollError: any) {
          addTerminalMessage(`Critical error during report processing stage: ${pollError.message}`, 'error');
          setReportError(`Error: ${pollError.message}`);
          clearInterval(intervalId);
          setPollingIntervalId(null);
          setIsGenerating(false);
        }
      }, 10000); // Poll every 10 seconds
      setPollingIntervalId(intervalId);
    } catch (error: any) {
      addTerminalMessage(`Failed to start report generation: ${error.message}`, 'error');
      setReportError(`Error: ${error.message}`);
      setIsGenerating(false);
    }
  };
  
  // Load stored reports from the server on mount and after new report
  const fetchReportsFromServer = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const reports = await res.json();
        setStoredReports(reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports from server:', err);
    }
  };
  useEffect(() => { fetchReportsFromServer(); }, []);
  useEffect(() => {
    if (isReportReadyForAccess && lastSuccessfulJobId) {
      fetchReportsFromServer();
    }
  }, [isReportReadyForAccess, lastSuccessfulJobId]);

  const filteredReports = storedReports.filter(report => 
    report.companyAlias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modern Hero Section (centered, balanced) */}
      <section className="bg-white w-full relative overflow-hidden flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center pt-32 px-4">
          <header className="max-w-4xl w-full text-center mx-auto">
            <h1 className="font-anton text-5xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight text-gray-900 md:text-7xl font-sans mb-10">
              Welcome to Adamass AI
          </h1>
            <p className="my-7 max-w-4xl mx-auto tracking-tight text-gray-500 md:text-xl font-light font-sans">
              Unlock a comprehensive desktop review. Fill in the company details, click <span className="font-semibold">"Generate Report"</span>, and receive your analysis in minutes. Or, search for a previously analyzed company.
            </p>
          </header>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3 w-full">
            <a href="#main-content" className="w-full sm:w-auto px-6 py-2.5 text-base font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 text-center">Start Desktop Review</a>
            <a href="#reports-section" className="w-full sm:w-auto px-6 py-2.5 text-base font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500 text-center">See Past Reports</a>
          </div>
          {/* BrowserMockup-style placeholder for report image */}
          <div className="relative mt-12 flex h-full w-full flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-100" style={{ WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 50px, black 100%)', maskImage: 'linear-gradient(to top, transparent 0%, black 30%, black 80%)' }}>
              <div className="flex items-center justify-between gap-10 bg-gray-100 px-8 py-4 lg:gap-25">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <div className="flex w-full items-center justify-center">
                  <p className="relative hidden w-full rounded-full bg-white px-4 py-1 text-center text-sm tracking-tight md:block">
                    https://www.adamass.se/adamassai/report
                  </p>
                </div>
                <div className="flex items-center gap-4 opacity-30">
                  {/* Icons can be added here if you want */}
                </div>
              </div>
              <div className="relative w-full">
                {/* Insert your report image here */}
                <img
                  src="/demo-hero.png"
                  alt="Demo Report Screenshot"
                  className="aspect-video h-96 w-full object-contain object-top rounded-b-3xl bg-white"
                />
              </div>
            </div>
            {/* Fade-out handled by mask-image above */}
          </div>
        </div>
      </section>

      {/* Main Content Anchor */}
      <section id="main-content" className="pt-16 flex justify-center items-start w-full">
        <div className="w-full max-w-5xl bg-white rounded-lg p-6 sm:p-10 mx-auto mt-16">
          {/* Section Title: Desktop Review */}
          <h2 className="text-center text-5xl font-bold mb-14 bg-gradient-to-r from-cyan-400 via-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight">Start a Desktop Review</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-stretch">
            {/* Left Side: Form Card */}
            <div className="space-y-5 flex flex-col bg-gray-50 p-6 rounded-lg">
              <InputField
                id="companyAlias"
                label="Company Alias"
                value={companyAlias}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyAlias(e.target.value)}
                placeholder="e.g., Innovatech"
                disabled={isGenerating || !!currentJobId}
              />
              <InputField
                id="legalAlias"
                label="Legal Alias (Optional)"
                value={legalAlias}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLegalAlias(e.target.value)}
                placeholder="e.g., Innovatech Solutions Ltd."
                disabled={isGenerating || !!currentJobId}
              />
              <InputField
                id="websiteUrl"
                label="Website URL"
                type="url"
                value={websiteUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsiteUrl(e.target.value)}
                placeholder="e.g., https://innovatech.com"
                disabled={isGenerating || !!currentJobId}
              />
              <InputField
                id="countryOfIncorporation"
                label="Country of Incorporation (Optional)"
                value={countryOfIncorporation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountryOfIncorporation(e.target.value)}
                placeholder="e.g., USA, Germany, Singapore"
                disabled={isGenerating || !!currentJobId}
              />
              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-auto"> 
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !!currentJobId}
                  className={`w-full sm:flex-1 px-6 py-3 text-base font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isGenerating || !!currentJobId
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                >
                  {currentJobId ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (isGenerating ? 'Initializing...':'Generate Report')}
                </button>
                <button
                  onClick={() => {
                    if (lastSuccessfulJobId) {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('currentJobId', lastSuccessfulJobId);
                      }
                      router.push('/report');
                    } else {
                      addTerminalMessage("No report is ready to be accessed or Job ID is missing.", "error");
                    }
                  }}
                  disabled={!isReportReadyForAccess}
                  className={`w-full sm:flex-1 px-6 py-3 text-base font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isReportReadyForAccess
                      ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Access Report
                </button>
              </div>
            </div>

            {/* Right Side: Terminal */}
            <div className="bg-gray-900 p-5 rounded-lg h-96 lg:h-full flex flex-col mt-6 lg:mt-0">
              <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-200">Process Log</h3>
                  {(isGenerating || !!currentJobId || terminalOutput.length > 0 || generationStep || reportError) && (
                       <button 
                          onClick={() => {
                              setTerminalOutput([]);
                              setGenerationStep(null); // Clear user-facing step message
                              setReportError(null); // Clear user-facing error message
                              // Only add a cleared message if not actively processing
                              if (!isGenerating && !currentJobId) { 
                                  addTerminalMessage("Terminal cleared. Ready for new task.", "system");
                              }
                          }}
                          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                          title="Clear Terminal"
                      >
                          Clear Log
                      </button>
                  )}
              </div>
              <div ref={terminalRef} className="flex-grow overflow-y-auto font-mono text-sm text-gray-900 space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 h-64 bg-grey-900 rounded-lg">
                {generationStep && !reportError && (
                  <p className={'text-yellow-400 p-1 bg-black/20 rounded mb-1 font-medium'}>{generationStep}</p>
                )}
                {reportError && (
                  <p className={'text-red-500 p-1 bg-black/20 rounded mb-1 font-medium'}>Error: {reportError}</p>
                )}
                {terminalOutput.map((line, index) => (
                  <p key={index} className={`whitespace-pre-wrap ${line.startsWith('❌') ? 'text-red-400' : line.startsWith('✅') ? 'text-green-400' : line.startsWith('⚙️') ? 'text-blue-400' : 'text-gray-300'}`}>{line}</p>
                ))}
                {terminalOutput.length === 0 && !generationStep && !reportError && (
                   <p className="text-gray-500 italic">Process activity will appear here...</p>
                )}
              </div>
            </div>
          </div>

          {/* Previously Analyzed Section */}
          <div className="mt-24">
            <h2 className="text-center text-5xl font-bold mb-14 bg-gradient-to-r from-cyan-400 via-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight">Previously Analyzed Companies</h2>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Search and Filtered List */}
              <div>
                <input 
                  type="text"
                  placeholder="Search by company alias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 bg-gray-50 mb-6 text-lg"
                />
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white overflow-hidden min-h-[120px] flex flex-col justify-center">
                  {searchTerm.trim() === '' ? (
                    <div className="py-10 text-center text-gray-400 text-lg">Start typing to search for a company.</div>
                  ) : filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                      <div 
                        key={report.jobId}
                        className="px-6 py-5 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          localStorage.setItem('currentJobId', report.jobId);
                          router.push('/report');
                        }}
                      >
                        <span className="font-semibold text-blue-600 text-lg group-hover:underline">{report.companyAlias}</span>
                        <span className="text-xs text-gray-500 ml-2">{new Date(report.dateGenerated).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-500 text-lg">No analysis found.</div>
                  )}
                </div>
              </div>
              {/* Right: Scrollable Database of All Companies */}
              <div>
                <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100">
                  {storedReports.length > 0 ? (
                    storedReports.map(report => (
                      <div 
                        key={report.jobId}
                        className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div>
                          <span className="font-semibold text-blue-700 text-base">{report.companyAlias}</span>
                          <div className="text-xs text-gray-500 mt-1">Generated: {new Date(report.dateGenerated).toLocaleDateString()}</div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition"
                          onClick={() => {
                            localStorage.setItem('currentJobId', report.jobId);
                            router.push('/report');
                          }}
                        >
                          View Report
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-gray-400 text-lg">No companies in database.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

      </div>
    </section>
    </>
  );
};

export default Hero; 