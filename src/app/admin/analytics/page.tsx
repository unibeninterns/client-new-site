"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, Award, FileCheck, TrendingUp, Building2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const mockData = {
  stage1: {
    title: "Proposal Submissions",
    description: "Faculties with researchers who submitted proposals",
    total: 8,
    faculties: [
      { id: 1, name: "Faculty of Engineering", code: "ENG", count: 45, percentage: 35 },
      { id: 2, name: "Faculty of Science", code: "SCI", count: 32, percentage: 25 },
      { id: 3, name: "Faculty of Medicine", code: "MED", count: 28, percentage: 22 },
      { id: 4, name: "Faculty of Arts", code: "ART", count: 15, percentage: 12 },
      { id: 5, name: "Faculty of Business", code: "BUS", count: 8, percentage: 6 }
    ]
  },
  stage2: {
    title: "Award Approvals",
    description: "Faculties with approved proposals and awards",
    total: 6,
    faculties: [
      { id: 1, name: "Faculty of Engineering", code: "ENG", count: 18, percentage: 40 },
      { id: 2, name: "Faculty of Science", code: "SCI", count: 12, percentage: 27 },
      { id: 3, name: "Faculty of Medicine", code: "MED", count: 10, percentage: 22 },
      { id: 4, name: "Faculty of Arts", code: "ART", count: 5, percentage: 11 }
    ]
  },
  stage3: {
    title: "Full Proposal Approvals", 
    description: "Faculties with approved full proposal submissions",
    total: 4,
    faculties: [
      { id: 1, name: "Faculty of Engineering", code: "ENG", count: 8, percentage: 44 },
      { id: 2, name: "Faculty of Science", code: "SCI", count: 5, percentage: 28 },
      { id: 3, name: "Faculty of Medicine", code: "MED", count: 3, percentage: 17 },
      { id: 4, name: "Faculty of Arts", code: "ART", count: 2, percentage: 11 }
    ]
  }
};

const FacultyCard = ({ faculty, stage, maxCount }) => {
  const barWidth = (faculty.count / maxCount) * 100;
  
  const getStageColor = (stage) => {
    switch(stage) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-green-500'; 
      case 3: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColorLight = (stage) => {
    switch(stage) {
      case 1: return 'bg-blue-50 border-blue-200';
      case 2: return 'bg-green-50 border-green-200';
      case 3: return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getStageColorLight(stage)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{faculty.name}</h4>
          <p className="text-sm text-gray-600">{faculty.code}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{faculty.count}</span>
          <p className="text-xs text-gray-500">{faculty.percentage}%</p>
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

const StageHeader = ({ stage, data, icon: Icon }) => {
  const getStageColor = (stage) => {
    switch(stage) {
      case 1: return 'text-blue-600 bg-blue-100';
      case 2: return 'text-green-600 bg-green-100'; 
      case 3: return 'text-purple-600 bg-purple-100';
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

const FunnelVisualization = () => {
  const stages = [
    { data: mockData.stage1, color: 'bg-blue-500', width: '100%' },
    { data: mockData.stage2, color: 'bg-green-500', width: '70%' },
    { data: mockData.stage3, color: 'bg-purple-500', width: '40%' }
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
            {Math.round((mockData.stage2.faculties.reduce((sum, f) => sum + f.count, 0) / 
                        mockData.stage1.faculties.reduce((sum, f) => sum + f.count, 0)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Stage 1 → 2 Conversion</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {Math.round((mockData.stage3.faculties.reduce((sum, f) => sum + f.count, 0) / 
                        mockData.stage2.faculties.reduce((sum, f) => sum + f.count, 0)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Stage 2 → 3 Conversion</div>
        </div>
      </div>
    </div>
  );
};

export default function ResearchFunnelDashboard() {
  const [selectedStage, setSelectedStage] = useState(1);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getCurrentStageData = () => {
    switch(selectedStage) {
      case 1: return mockData.stage1;
      case 2: return mockData.stage2;
      case 3: return mockData.stage3;
      default: return mockData.stage1;
    }
  };

  const stageData = getCurrentStageData();
  const maxCount = Math.max(...stageData.faculties.map(f => f.count));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Funding Analytics</h1>
          <p className="text-gray-600">Track proposal submissions, approvals, and full proposal outcomes across faculties</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">128</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Awards Approved</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Full Proposals</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
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
                <p className="text-2xl font-bold text-gray-900">14%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <FunnelVisualization />

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
            data={stageData}
            icon={selectedStage === 1 ? Users : selectedStage === 2 ? Award : FileCheck}
          />

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stageData.faculties.map((faculty, index) => (
              <div
                key={faculty.id}
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
                  <p className="text-xs text-gray-600">{stageData.faculties[0]?.name}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Average per Faculty</p>
                  <p className="text-xs text-gray-600">
                    {Math.round(stageData.faculties.reduce((sum, f) => sum + f.count, 0) / stageData.faculties.length)}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Active Faculties</p>
                  <p className="text-xs text-gray-600">{stageData.total} out of 12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}