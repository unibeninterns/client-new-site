"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFacultiesWithSubmissions, 
  getFacultiesWithApprovedAwards, 
  getFacultiesWithApprovedFullProposals 
} from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { ChevronRight, Users, Award, FileCheck, TrendingUp, Building2, Clock, CheckCircle2, Loader2 } from 'lucide-react';

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
  // Gracefully handle the case where data is not yet available
  if (!stageData || stageData.length < 3) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
      </div>
    );
  }

  // Pre-calculate total counts for easy use in explanations
  const totalSubmissions = stageData[0].faculties.reduce((sum, f) => sum + f.count, 0);
  const totalAwards = stageData[1].faculties.reduce((sum, f) => sum + f.count, 0);
  const totalFullProposals = stageData[2].faculties.reduce((sum, f) => sum + f.count, 0);
  
  const stages = [
    {
      data: stageData[0],
      color: 'bg-blue-500', // Stage 1 Color
      width: '90%',
      totalCount: totalSubmissions,
      explanation: (
        <p className='font-bold'>
          A total of <span className="font-bold">{totalSubmissions}</span> IBR proposals were received from{' '}
          <span className="font-bold">{stageData[0].total}</span> Faculties, Schools and Institutes digitally and processed by a custom review system.
        </p>
      ),
    },
    {
      data: stageData[1],
      color: 'bg-purple-500', // Stage 2 Color
      width: '85%',
      totalCount: totalAwards,
      explanation: (
        <p className='font-bold'>
          Each proposal was subjected to a blind reviewing process by three (3) sets of reviewers from different clusters. We had the AI reviewer and the human reviewer; when there's a discrepancy of up to 20% in the scores gotten by both, a reconciliation reviewer is then assigned to make an independent score. The scores were collated, and the average computed. The results were used in the decision-making process to award approvals to{' '}
          <span className="font-bold">{totalAwards}</span> eligible proposals to proceed to the next stage.
        </p>
      ),
    },
    {
      data: stageData[2],
      color: 'bg-green-500', // Stage 3 Color
      width: '80%',
      totalCount: totalFullProposals,
      explanation: (
        <p className='font-bold'>
          After all the full proposals were submitted and graded by the review committee, a total of{' '}
          <span className="font-bold">{totalFullProposals}</span> full proposals were shortlisted from{' '}
          <span className="font-bold">{stageData[2].total}</span> Faculties, Schools and Institutes. The recommended{' '}
          <span className="font-bold">{totalFullProposals}</span> full proposals, if approved by the Vice Chancellor, will be processed further to TETFund for consideration and release of funds.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-8 text-center">Research Funding Funnel</h3>
      
      {/* Container for all stages */}
      <div className="flex flex-col space-y-8">
        {stages.map((stage, index) => (
          <React.Fragment key={index}>
            {/* A single stage row with a responsive grid layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[0.5fr_1fr_2fr] gap-4 lg:gap-4 items-center">
              
              {/* Column 1: Stage Number */}
              <div className="text-center lg:text-right">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-800 lg:text-gray-600 uppercase tracking-wider">
                Stage {index + 1}
              </h2>
              </div>
              
              {/* Column 2: Data Card */}
              <div className="flex justify-center">
              <div 
              className={`${stage.color} rounded-lg p-4 text-white text-center w-full max-w-xs shadow-lg`}
              style={{ width: stage.width, minWidth: '200px' }}>
                <div className="font-semibold">{stage.data.title}</div>
                <div className="text-sm opacity-90">{stage.data.total} Faculties</div>
                <div className="text-2xl font-bold">{stage.totalCount} Total</div>
              </div>
              </div>

              {/* Column 3: Explanation Text */}
              <div className="text-gray-600 text-sm leading-relaxed px-4 lg:px-0">
              {stage.explanation}
              </div>
            </div>

            {/* Chevron separator, hidden after the last stage */}
            {index < stages.length - 1 && (
              <div className="flex justify-center">
                  <ChevronRight className="w-8 h-8 text-gray-300 rotate-90" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Conversion Metrics (Your existing code for this section is fine) */}
      <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {stageData[1]?.faculties.length > 0 && stageData[0]?.faculties.length > 0
              ? Math.round((totalAwards / totalSubmissions) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Stage 1 → 2 Conversion</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {stageData[2]?.faculties.length > 0 && stageData[1]?.faculties.length > 0
              ? Math.round((totalFullProposals / totalAwards) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Stage 2 → 3 Conversion</div>
        </div>
      </div>
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
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Funding Analytics</h1>
            <p className="text-gray-600">Track proposal submissions, approvals, and full proposal outcomes across faculties</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
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
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}