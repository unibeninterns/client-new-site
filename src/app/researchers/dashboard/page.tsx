"use client";

import { useEffect, useState } from 'react';
import ResearcherLayout from '@/components/researchers/ResearcherLayout';
import { getResearcherDashboard } from '@/services/api';
import { FileText, ClipboardList, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface RecentProposal {
  _id: string;
  title: string;
  projectTitle: string;
  status: string;
  updatedAt: string;
}

interface DashboardData {
  profile: {
    name: string;
    email: string;
  };
  stats: {
    totalProposals: number;
    statusCounts: {
      submitted: number;
      under_review: number;
      approved: number;
      rejected: number;
      revision_requested: number;
    };
  };
  recentProposal: RecentProposal;
}

export default function ResearcherDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getResearcherDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ResearcherLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : dashboardData && (
          <>
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {dashboardData.profile.name}</h1>
              <p className="text-gray-600">Manage your research proposals and track their status.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="bg-purple-100 p-3 rounded-full mb-3">
                  <FileText className="h-6 w-6 text-purple-800" />
                </div>
                <p className="text-lg font-bold text-gray-800">{dashboardData.stats.totalProposals}</p>
                <p className="text-sm text-gray-600">Total Proposals</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <ClipboardList className="h-6 w-6 text-blue-800" />
                </div>
                <p className="text-lg font-bold text-gray-800">{dashboardData.stats.statusCounts.submitted}</p>
                <p className="text-sm text-gray-600">Submitted</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="bg-yellow-100 p-3 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-yellow-800" />
                </div>
                <p className="text-lg font-bold text-gray-800">{dashboardData.stats.statusCounts.under_review}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6 text-green-800" />
                </div>
                <p className="text-lg font-bold text-gray-800">{dashboardData.stats.statusCounts.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              
              {dashboardData.recentProposal ? (
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-lg">{dashboardData.recentProposal.projectTitle || 'Untitled Proposal'}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dashboardData.recentProposal.status)}`}>
                      {dashboardData.recentProposal.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-sm ml-3">
                      Last updated: {formatDate(dashboardData.recentProposal.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link 
                      href={`/researchers/proposals/${dashboardData.recentProposal._id}`}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No recent proposals found. Submit your first proposal!</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/" target='_blank'
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Submit New Proposal</h3>
                <p className="text-gray-600 text-sm">Start a new research proposal submission</p>
              </Link>
              
              <Link
                href="/researchers/proposals" 
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 mb-2">View All Proposals</h3>
                <p className="text-gray-600 text-sm">Check status and details of all your submitted proposals</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </ResearcherLayout>
  );
}