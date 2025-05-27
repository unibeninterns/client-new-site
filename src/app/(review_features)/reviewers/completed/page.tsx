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
                  <p className="text-sm font-medium text-gray-600">Regular Reviews</p>
                  <p className="text-2xl font-bold text-purple-600">{reviewTypeStats.human}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reconciliation Reviews</p>
                  <p className="text-2xl font-bold text-purple-600">{reviewTypeStats.reconciliation}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="recent">Sort by Recent</option>
                    <option value="score">Sort by Score</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  {['all', 'human', 'reconciliation'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterType === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search completed reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Completed Reviews List */}
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed reviews found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'You haven\'t completed any reviews yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {review.proposal.projectTitle}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {review.proposal.submitter.name}
                              </div>
                              {review.proposal.submitter.faculty && (
                                <div className="flex items-center">
                                  <Building className="w-4 h-4 mr-1" />
                                  {review.proposal.submitter.faculty.title}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Completed: {new Date(review.completedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {review.reviewType === 'reconciliation' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Award className="w-3 h-3 mr-1" />
                                Reconciliation
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-2 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700">Score</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-bold ${getScoreColor(review.totalScore)}`}>
                                {review.totalScore}/100
                              </span>
                              <p className="text-xs text-gray-500">{getScoreGrade(review.totalScore)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Due Date</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(review.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          {review.proposal.estimatedBudget && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Budget</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                ₦{review.proposal.estimatedBudget.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Score Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center mb-3">
                            <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Score Breakdown</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-3 transition-all duration-500"
                              style={{ width: `${review.totalScore}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>0</span>
                            <span className="font-medium">{review.totalScore}/100</span>
                            <span>100</span>
                          </div>
                        </div>

                        {/* Comments Preview */}
                        {review.comments && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Review Comments</p>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {review.comments.length > 150 
                                    ? `${review.comments.substring(0, 150)}...` 
                                    : review.comments}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                        <Link
                          href={`/reviewers/assignments/${review._id}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReviewerLayout>
  );
};

export default CompletedReviews;