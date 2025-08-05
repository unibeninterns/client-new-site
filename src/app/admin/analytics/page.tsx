"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFacultiesWithSubmissions, 
  getFacultiesWithApprovedAwards, 
  getFacultiesWithApprovedFullProposals 
} from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { ChevronRight, Users, Award, FileCheck, TrendingUp, Building2, Clock, CheckCircle2, Loader2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FacultyData {
  _id: string;
  facultyName: string;
  facultyCode: string;
  count: number;
  percentage?: number;
}

interface StageData {
  title: string;
  description: string;
  total: number;
  faculties: FacultyData[];
}

interface ExportReportButtonProps {
  headerSectionRef: React.RefObject<HTMLDivElement | null>;
  stageContentRef: React.RefObject<HTMLDivElement | null>;
  stageData: StageData[];
  selectedStage: number;
  setSelectedStage: (stage: number) => void;
}

const FacultyCard = ({ faculty, stage, maxCount }: { faculty: FacultyData; stage: number; maxCount: number }) => {
  const barWidth = (faculty.count / maxCount) * 100;
  
  const getStageColor = (stage: number) => {
    switch(stage) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-purple-500'; 
      case 3: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColorLight = (stage: number) => {
    switch(stage) {
      case 1: return 'bg-blue-50 border-blue-200';
      case 2: return 'bg-purple-50 border-purple-200';
      case 3: return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getStageColorLight(stage)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{faculty.facultyName}</h4>
          <p className="text-sm text-gray-600">{faculty.facultyCode}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{faculty.count}</span>
          {faculty.percentage && (
            <p className="text-xs text-gray-500">{faculty.percentage}%</p>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${getStageColor(stage)}`}
          style={{ width: `${barWidth}%` }}
        ></div>
      </div>
    </div>
  );
};

const StageHeader = ({ stage, data, icon: Icon }: { stage: number; data: StageData; icon: React.ComponentType<{ className?: string }> }) => {
  const getStageColor = (stage: number) => {
    switch(stage) {
      case 1: return 'text-blue-600 bg-blue-100';
      case 2: return 'text-purple-600 bg-purple-100'; 
      case 3: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="text-center mb-6">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getStageColor(stage)}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{data.title}</h3>
      <p className="text-gray-600 mb-4">{data.description}</p>
      <div className="flex justify-center items-center gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
          <span className="text-2xl font-bold text-gray-900">{data.total}</span>
          <p className="text-sm text-gray-600">Faculties</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
          <span className="text-2xl font-bold text-gray-900">
            {data.faculties.reduce((sum, f) => sum + f.count, 0)}
          </span>
          <p className="text-sm text-gray-600">Total Count</p>
        </div>
      </div>
    </div>
  );
};

const FunnelVisualization = ({ stageData }: { stageData: StageData[] }) => {
  const stages = [
    { data: stageData[0], color: 'bg-blue-500', width: '100%' },
    { data: stageData[1], color: 'bg-purple-500', width: '70%' },
    { data: stageData[2], color: 'bg-green-500', width: '40%' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Research Funding Funnel</h3>
      <div className="flex flex-col items-center space-y-4">
        {stages.map((stage, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div 
                className={`${stage.color} rounded-lg p-4 text-white text-center transition-all duration-500`}
                style={{ width: stage.width, minWidth: '200px' }}
              >
                <div className="font-semibold">{stage.data.title}</div>
                <div className="text-sm opacity-90">{stage.data.total} Faculties</div>
                <div className="text-lg font-bold">
                  {stage.data.faculties.reduce((sum, f) => sum + f.count, 0)} Total
                </div>
              </div>
            </div>
            {index < stages.length - 1 && (
              <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Conversion Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {stageData[1]?.faculties.length > 0 && stageData[0]?.faculties.length > 0
              ? Math.round((stageData[1].faculties.reduce((sum, f) => sum + f.count, 0) / 
                          stageData[0].faculties.reduce((sum, f) => sum + f.count, 0)) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Stage 1 → 2 Conversion</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {stageData[2]?.faculties.length > 0 && stageData[1]?.faculties.length > 0
              ? Math.round((stageData[2].faculties.reduce((sum, f) => sum + f.count, 0) / 
                          stageData[1].faculties.reduce((sum, f) => sum + f.count, 0)) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Stage 2 → 3 Conversion</div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Export Component with better error handling
const ExportReportButton: React.FC<ExportReportButtonProps> = ({ 
  headerSectionRef, 
  stageContentRef, 
  stageData, 
  selectedStage, 
  setSelectedStage 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Enhanced capture function with better options
  const captureSection = async (ref: React.RefObject<HTMLDivElement | null>, scale = 1.5) => {
    if (!ref.current) throw new Error('Reference not found');
    
    // Get computed styles and convert oklch to rgb
    const element = ref.current;
    const computedStyle = window.getComputedStyle(element);
    
    const canvas = await html2canvas(element, { 
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable logging to reduce console noise
      removeContainer: true,
      foreignObjectRendering: true,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
      },
      onclone: (clonedDoc) => {
        // Convert oklch colors to hex/rgb in the cloned document
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            color: rgb(16, 16, 16) !important;
            background-color: inherit !important;
          }
          .bg-white { background-color: #ffffff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-200 { background-color: #e5e7eb !important; }
          .bg-gray-600 { background-color: #4b5563 !important; }
          .bg-gray-900 { background-color: #111827 !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-blue-200 { background-color: #bfdbfe !important; }
          .bg-blue-500 { background-color: #3b82f6 !important; }
          .bg-blue-600 { background-color: #2563eb !important; }
          .bg-purple-50 { background-color: #faf5ff !important; }
          .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-purple-200 { background-color: #e9d5ff !important; }
          .bg-purple-500 { background-color: #8b5cf6 !important; }
          .bg-purple-600 { background-color: #7c3aed !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-green-100 { background-color: #dcfce7 !important; }
          .bg-green-200 { background-color: #bbf7d0 !important; }
          .bg-green-500 { background-color: #22c55e !important; }
          .bg-green-600 { background-color: #16a34a !important; }
          .bg-orange-100 { background-color: #fed7aa !important; }
          .text-white { color: #ffffff !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-900 { color: #111827 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-purple-600 { color: #7c3aed !important; }
          .text-green-600 { color: #16a34a !important; }
          .text-orange-600 { color: #ea580c !important; }
          .border-blue-200 { border-color: #bfdbfe !important; }
          .border-purple-200 { border-color: #e9d5ff !important; }
          .border-green-200 { border-color: #bbf7d0 !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important; }
          .border { border: 1px solid #e5e7eb !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    return canvas.toDataURL('image/png', 0.95);
  };

  const exportFullReport = async () => {
    if (!headerSectionRef.current || !stageContentRef.current || stageData.length === 0) {
      alert('Data not ready for export. Please wait for the page to load completely.');
      return;
    }

    setIsExporting(true);
    const originalStage = selectedStage;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let pageCount = 0;

      // Page 1: Header section (Header + Summary + Funnel)
      setExportProgress('Capturing overview section...');
      await sleep(800); // Allow UI to update
      
      const headerImage = await captureSection(headerSectionRef);
      
      // Calculate dimensions to fit page
      const headerImg = new Image();
      await new Promise((resolve) => {
        headerImg.onload = resolve;
        headerImg.src = headerImage;
      });
      
      const headerAspectRatio = headerImg.height / headerImg.width;
      const headerHeight = Math.min(pageWidth * headerAspectRatio, pageHeight - 20);
      const headerWidth = headerHeight / headerAspectRatio;
      
      pdf.addImage(headerImage, 'PNG', 0, 10, headerWidth, headerHeight);
      pageCount++;

      // Pages 2-4: Each stage content
      for (let stage = 1; stage <= 3; stage++) {
        setExportProgress(`Preparing Stage ${stage} content...`);
        
        // Switch to the stage and wait for rendering
        setSelectedStage(stage);
        await sleep(1200); // Wait longer for stage switch and animations

        setExportProgress(`Capturing Stage ${stage} content...`);
        
        const stageImage = await captureSection(stageContentRef);
        
        // Calculate dimensions
        const stageImg = new Image();
        await new Promise((resolve) => {
          stageImg.onload = resolve;
          stageImg.src = stageImage;
        });
        
        const stageAspectRatio = stageImg.height / stageImg.width;
        const stageHeight = Math.min(pageWidth * stageAspectRatio, pageHeight - 20);
        const stageWidth = stageHeight / stageAspectRatio;
        
        // Add new page for stages
        pdf.addPage();
        pdf.addImage(stageImage, 'PNG', 0, 10, stageWidth, stageHeight);
        pageCount++;
        
        setExportProgress(`Stage ${stage} captured (${pageCount} pages complete)`);
        await sleep(300);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `research-analytics-report-${timestamp}.pdf`;
      
      setExportProgress('Generating PDF...');
      await sleep(500);
      
      pdf.save(filename);
      setExportProgress('Export completed successfully!');
      
      // Reset to original stage
      setSelectedStage(originalStage);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress('Export failed. Please try again.');
      setIsExporting(false);
      setSelectedStage(originalStage);
      
      setTimeout(() => {
        setExportProgress('');
      }, 3000);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={exportFullReport}
        disabled={isExporting || stageData.length === 0}
        className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 ${
          isExporting || stageData.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:shadow-md'
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Full Report
          </>
        )}
      </button>
      
      {exportProgress && (
        <div className={`text-sm font-medium px-3 py-1 rounded-md ${
          exportProgress.includes('failed') 
            ? 'text-red-700 bg-red-50' 
            : exportProgress.includes('completed')
            ? 'text-green-700 bg-green-50'
            : 'text-blue-700 bg-blue-50'
        }`}>
          {exportProgress}
        </div>
      )}
    </div>
  );
};

export default function ResearchFunnelDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState(1);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [stageData, setStageData] = useState<StageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for export functionality
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const stageContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [submissions, awards, fullProposals] = await Promise.all([
          getFacultiesWithSubmissions(),
          getFacultiesWithApprovedAwards(),
          getFacultiesWithApprovedFullProposals()
        ]);

        // Calculate percentages for each stage
        const processStageData = (data: FacultyData[], title: string, description: string): StageData => {
          const totalCount = data.reduce((sum, item) => sum + item.count, 0);
          const processedData = data.map(item => ({
            ...item,
            percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
          }));
          
          return {
            title,
            description,
            total: data.length,
            faculties: processedData
          };
        };

        const processedData = [
          processStageData(submissions.data, "Proposal Submissions", "Faculties with researchers who submitted proposals"),
          processStageData(awards.data, "Award Approvals", "Faculties with approved proposals and awards"),
          processStageData(fullProposals.data, "Full Proposal Approvals", "Faculties with approved full proposal submissions")
        ];

        setStageData(processedData);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
      </div>
    );
  }

  const getCurrentStageData = () => {
    return stageData[selectedStage - 1] || { title: '', description: '', total: 0, faculties: [] };
  };

  const currentStageData = getCurrentStageData();
  const maxCount = Math.max(...currentStageData.faculties.map(f => f.count));

  // Calculate summary statistics
  const totalSubmissions = stageData[0]?.faculties.reduce((sum, f) => sum + f.count, 0) || 0;
  const totalAwards = stageData[1]?.faculties.reduce((sum, f) => sum + f.count, 0) || 0;
  const totalFullProposals = stageData[2]?.faculties.reduce((sum, f) => sum + f.count, 0) || 0;
  const successRate = totalSubmissions > 0 ? Math.round((totalFullProposals / totalSubmissions) * 100) : 0;

  return (
    <AdminLayout>
      <div className="py-6 bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {/* Header Section - Will be captured as Page 1 */}
          <div ref={headerSectionRef} className="bg-gray-50 pb-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Funding Analytics</h1>
                <p className="text-gray-600">Track proposal submissions, approvals, and full proposal outcomes across faculties</p>
              </div>
              
              {/* Export Button positioned in header */}
              <ExportReportButton
                headerSectionRef={headerSectionRef}
                stageContentRef={stageContentRef}
                stageData={stageData}
                selectedStage={selectedStage}
                setSelectedStage={setSelectedStage}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                        <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Awards Approved</p>
                        <p className="text-2xl font-bold text-gray-900">{totalAwards}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Full Proposals</p>
                        <p className="text-2xl font-bold text-gray-900">{totalFullProposals}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funnel Visualization */}
                <FunnelVisualization stageData={stageData} />
              </>
            )}
          </div>

          {!isLoading && (
            /* Stage Content Section - Will be captured as Pages 2-4 */
            <div ref={stageContentRef} className="bg-gray-50 pt-8">
              {/* Stage Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-2 rounded-lg shadow-sm border flex space-x-2">
                  {[1, 2, 3].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        selectedStage === stage
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Stage {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage Content */}
              <div className={`transition-all duration-500 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <StageHeader 
                  stage={selectedStage} 
                  data={currentStageData}
                  icon={selectedStage === 1 ? Users : selectedStage === 2 ? Award : FileCheck}
                />

                {/* Faculty Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentStageData.faculties.map((faculty, index) => (
                    <div
                      key={faculty._id}
                      className={`transition-all duration-300 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <FacultyCard 
                        faculty={faculty} 
                        stage={selectedStage}
                        maxCount={maxCount}
                      />
                    </div>
                  ))}
                </div>

                {/* Stage-specific insights */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedStage === 1 && "Initial Submissions Insights"}
                    {selectedStage === 2 && "Award Approval Insights"} 
                    {selectedStage === 3 && "Full Proposal Success Insights"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">Top Faculty</p>
                        <p className="text-xs text-gray-600">{currentStageData.faculties[0]?.facultyName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">Average per Faculty</p>
                        <p className="text-xs text-gray-600">
                          {currentStageData.faculties.length > 0 
                            ? Math.round(currentStageData.faculties.reduce((sum, f) => sum + f.count, 0) / currentStageData.faculties.length)
                            : 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">Active Faculties</p>
                        <p className="text-xs text-gray-600">{currentStageData.total} participating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}