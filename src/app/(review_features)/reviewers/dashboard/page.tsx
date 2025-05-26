"use client";

import React, { useState, useEffect, useMemo } from 'react';
import ReviewerLayout from '@/components/reviewers/ReviewerLayout';
import { 
  Search, 
  ChevronDown, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Calendar,
  User,
  Award,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewerDashboard } from '@/services/api';
import { useRouter } from 'next/navigation';

// Types based on your API response structure
interface ReviewerInfo {
  name: string;
  email: string;
  department: any;
  faculty: any;
  academicTitle: string;
}

interface Statistics {
  pendingReviews: number;
  completed: number;
  inProgress: number;
  overdue: number;
  totalAssigned: number;
}

interface Proposal {
  _id: string;
  projectTitle: string;
  submitterType: string;
  status: string;
  reviewStatus: string;
  createdAt: string;
  submitter: {
    name: string;
    email: string;
  };
  faculty?: {
    name: string;
    code: string;
  };
  department?: {
    name: string;
    code: string;
  };
}

interface Review {
  _id: string;
  status: string;
  dueDate: string;
  completedAt?: string;
  proposal: {
    projectTitle: string;
    submitterType: string;
  };
}

interface DashboardData {
  reviewer: ReviewerInfo;
  statistics: Statistics;
  assignedProposals: Proposal[];
  completedReviews: Review[];
  inProgressReviews: Review[];
  overdueReviews: Review[];
}

const ReviewersDashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
      if (!authLoading && !isAuthenticated) {
        router.push('/reviewers/login');
      }
    }, [authLoading, isAuthenticated, router]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await getReviewerDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Filter and search logic
  const filteredProposals = useMemo(() => {
    if (!dashboardData) return [];
    
    let filtered = dashboardData.assignedProposals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.submitter.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => {
        switch (statusFilter) {
          case 'pending':
            return proposal.reviewStatus === 'pending';
          case 'in_progress':
            return proposal.reviewStatus === 'in_progress';
          case 'completed':
            return proposal.reviewStatus === 'reviewed';
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(proposal => {
        const proposalDate = new Date(proposal.createdAt);
        const diffTime = now.getTime() - proposalDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'last7days':
            return diffDays <= 7;
          case 'last30days':
            return diffDays <= 30;
          case 'recent':
            return diffDays <= 3;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [dashboardData, searchTerm, statusFilter, dateFilter]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority color for proposals
  const getPriorityColor = (daysOld: number) => {
    if (daysOld > 7) return 'border-l-red-500';
    if (daysOld > 3) return 'border-l-amber-500';
    return 'border-l-green-500';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  const { reviewer, statistics, assignedProposals } = dashboardData;

  return (
    <ReviewerLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Welcome back, {reviewer.name}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  {reviewer.academicTitle} • {reviewer.department?.name || 'Department'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-amber-600">{statistics.pendingReviews}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.inProgress}</p>
              </div>
              <Edit3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.totalAssigned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search proposals or researchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="all">All Dates</option>
                <option value="recent">Last 3 Days</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assigned Proposals ({filteredProposals.length})
            </h2>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No proposals found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'You have no assigned proposals at the moment'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProposals.map((proposal) => {
                const daysOld = Math.ceil((new Date().getTime() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={proposal._id}
                    className={`p-6 border-l-4 ${getPriorityColor(daysOld)} hover:bg-gray-50 transition-colors duration-200`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-4">
                            {proposal.projectTitle}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.reviewStatus)}`}>
                            {proposal.reviewStatus?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {proposal.submitter.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </div>
                          <div className="capitalize">
                            {proposal.submitterType.replace('_', ' ')}
                          </div>
                          {daysOld > 7 && (
                            <div className="flex items-center text-red-600">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              {daysOld} days old
                            </div>
                          )}
                        </div>
                        
                        {proposal.department && (
                          <p className="text-sm text-gray-500">
                            {proposal.department.name} • {proposal.faculty?.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {proposal.reviewStatus === 'reviewed' ? (
                          <Link
                            href={`./dashboard/proposal?id=${proposal._id}`}
                            className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                          >
                            <Eye size={16} className="mr-2" />
                            View Review
                          </Link>
                        ) : (
                          <Link
                            href={`./dashboard/proposal?id=${proposal._id}`}
                            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            <Edit3 size={16} className="mr-2" />
                            {proposal.reviewStatus === 'in_progress' ? 'Continue Review' : 'Start Review'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((statistics.completed / (statistics.totalAssigned || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.totalAssigned - statistics.completed - statistics.overdue}
              </p>
              <p className="text-sm text-gray-600">Remaining Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {statistics.overdue === 0 ? 'On Track' : `${statistics.overdue} Overdue`}
              </p>
              <p className="text-sm text-gray-600">Review Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ReviewerLayout>
  );
};

export default ReviewersDashboard;
