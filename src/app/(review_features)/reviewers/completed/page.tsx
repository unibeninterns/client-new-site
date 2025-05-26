"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReviewerLayout from '@/components/reviewers/ReviewerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getReviewerAssignments } from '@/services/api';
import {
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  TrendingUp,
  Award,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  Star,
  BarChart3,
  Clock,
  MessageSquare,
} from 'lucide-react';

interface CompletedReview {
  _id: string;
  proposal: {
    _id: string;
    projectTitle: string;
    submitterType: 'staff' | 'master_student';
    status: string;
    createdAt: string;
    estimatedBudget?: number;
    submitter: {
      name: string;
      email: string;
      faculty?: {
        title: string;
      };
      department?: {
        title: string;
      };
    };
  };
  reviewType: 'human' | 'reconciliation';
  status: 'completed';
  dueDate: string;
  completedAt: string;
  totalScore: number;
  comments?: string;
}

const CompletedReviews: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [completedReviews, setCompletedReviews] = useState<CompletedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'title'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'human' | 'reconciliation'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchCompletedReviews = async () => {
    try {
      setLoading(true);
      const response = await getReviewerAssignments();
      const allAssignments = response.data || [];
      
      // Filter for completed reviews only
      const completed = allAssignments.filter(
        (assignment: any) => assignment.status === 'completed'
      );
      
      setCompletedReviews(completed);
    } catch (err) {
      console.error('Error fetching completed reviews:', err);
      setError('Failed to load completed reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompletedReviews();
    }
  }, [isAuthenticated]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const sortReviews = (reviews: CompletedReview[]) => {
    switch (sortBy) {
      case 'recent':
        return [...reviews].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      case 'score':
        return [...reviews].sort((a, b) => b.totalScore - a.totalScore);
      case 'title':
        return [...reviews].sort((a, b) => a.proposal.projectTitle.localeCompare(b.proposal.projectTitle));
      default:
        return reviews;
    }
  };

  const filteredAndSortedReviews = sortReviews(
    completedReviews.filter(review => {
      const matchesSearch = review.proposal.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.proposal.submitter.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || review.reviewType === filterType;
      
      return matchesSearch && matchesFilter;
    })
  );

  const calculateAverageScore = () => {
    if (completedReviews.length === 0) return 0;
    const total = completedReviews.reduce((sum, review) => sum + review.totalScore, 0);
    return Math.round(total / completedReviews.length);
  };

  const getReviewTypeStats = () => {
    const human = completedReviews.filter(r => r.reviewType === 'human').length;
    const reconciliation = completedReviews.filter(r => r.reviewType === 'reconciliation').length;
    return { human, reconciliation };
  };

  if (authLoading || loading) {
    return (
      <ReviewerLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading completed reviews...</p>
          </div>
        </div>
      </ReviewerLayout>
    );
  }

  if (error) {
    return (
      <ReviewerLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-lg mb-4">
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={fetchCompletedReviews}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ReviewerLayout>
    );
  }

  const reviewTypeStats = getReviewTypeStats();
  const averageScore = calculateAverageScore();

  return (
    <ReviewerLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Completed Reviews</h1>
              <p className="text-gray-600">Review history and performance overview</p>
            </div>
            <button
              onClick={fetchCompletedReviews}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedReviews.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}/100
                  </p>
                  <p className="text-xs text-gray-500">{getScoreGrade(averageScore)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Reviews</p>
                  <p className="text-2xl font-bold text-purple-600">{reviewTypeStats.human}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6