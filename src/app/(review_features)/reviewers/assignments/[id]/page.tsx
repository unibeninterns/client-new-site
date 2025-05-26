"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Clock, AlertCircle, Save, Send, FileText, User, Calendar, DollarSign } from 'lucide-react';
import DiscrepancyAlert from '@/components/reviewers/DiscrepancyAlert';
import ReviewerLayout from '@/components/reviewers/ReviewerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewById, submitReview, saveReviewProgress } from '@/services/api';

interface ReviewerData {
  name: string;
  scores: Record<string, number>;
}

interface PreviousScores {
  reviewerA: ReviewerData;
  reviewerB: ReviewerData;
}

interface ReviewCriteria {
  id: keyof ScoreData;
  name: string;
  description: string;
  maxScore: number;
  scoreGiven?: number;
}

interface ScoreData {
  relevanceToNationalPriorities: number;
  originalityAndInnovation: number;
  clarityOfResearchProblem: number;
  methodology: number;
  literatureReview: number;
  teamComposition: number;
  feasibilityAndTimeline: number;
  budgetJustification: number;
  expectedOutcomes: number;
  sustainabilityAndScalability: number;
}

interface ProposalData {
  _id: string;
  projectTitle: string;
  submitterType: string;
  status: string;
  createdAt: string;
  estimatedBudget: number;
  problemStatement: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  workPlan: string;
  submitter: {
    name: string;
    email: string;
    academicTitle?: string;
    faculty: {
      title: string;
    };
    department: {
      title: string;
    };
  };
}

interface ReviewData {
  _id: string;
  proposal: ProposalData;
  reviewType: 'human' | 'ai' | 'reconciliation';
  scores: ScoreData;
  comments: string;
  totalScore: number;
  status: 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  completedAt?: string;
}

const ProposalReviewForm: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousScores, setPreviousScores] = useState<PreviousScores | null>(null);

  const [reviewCriteria, setReviewCriteria] = useState<ReviewCriteria[]>([
    {
      id: 'relevanceToNationalPriorities',
      name: 'Relevance to National/Institutional Priorities',
      description: "Alignment with Nigeria's national development goals or UNIBEN research priorities",
      maxScore: 10,
    },
    {
      id: 'originalityAndInnovation',
      name: 'Originality and Innovation',
      description: 'Novelty of research idea; advancement of knowledge; creativity',
      maxScore: 15,
    },
    {
      id: 'clarityOfResearchProblem',
      name: 'Clarity of Research Problem and Objectives',
      description: 'Clearly defined problem statement and SMART objectives',
      maxScore: 10,
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Appropriateness, rigor, and feasibility of the research design, tools, and approach',
      maxScore: 15,
    },
    {
      id: 'literatureReview',
      name: 'Literature Review and Theoretical Framework',
      description: 'Sound grounding in existing literature; clear conceptual framework',
      maxScore: 10,
    },
    {
      id: 'teamComposition',
      name: 'Team Composition and Expertise',
      description: 'Appropriateness of team, interdisciplinary balance, qualifications',
      maxScore: 10,
    },
    {
      id: 'feasibilityAndTimeline',
      name: 'Feasibility and Timeline',
      description: 'Realistic scope, milestones, and timeline within funding duration',
      maxScore: 10,
    },
    {
      id: 'budgetJustification',
      name: 'Budget Justification and Cost-Effectiveness',
      description: 'Clear and justified budget aligned with project goals',
      maxScore: 10,
    },
    {
      id: 'expectedOutcomes',
      name: 'Expected Outcomes and Impact',
      description: 'Potential contributions to policy, community, academia, industry',
      maxScore: 5,
    },
    {
      id: 'sustainabilityAndScalability',
      name: 'Sustainability and Scalability',
      description: 'Potential for continuation, replication, or scale-up beyond funding',
      maxScore: 5,
    }
  ]);

  const [reviewComments, setReviewComments] = useState<string>('');

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch review data
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!reviewId || !isAuthenticated) return;

      try {
        setLoading(true);
        const response = await getReviewById(reviewId);
        
        if (response.success) {
          const review = response.data;
          setReviewData(review);
          setReviewComments(review.comments || '');
          
          // Update criteria with existing scores
          setReviewCriteria(prev => 
            prev.map(criteria => ({
              ...criteria,
              scoreGiven: review.scores[criteria.id] || undefined
            }))
          );

          // If this is a reconciliation review, fetch previous scores
          if (review.reviewType === 'reconciliation') {
            // Mock previous scores for reconciliation - in real implementation,
            // you might need another API endpoint to get previous review scores
            setPreviousScores({
              reviewerA: {
                name: "Reviewer A",
                scores: {
                  'relevanceToNationalPriorities': Math.floor(Math.random() * 10) + 1,
                  'originalityAndInnovation': Math.floor(Math.random() * 15) + 1,
                  'clarityOfResearchProblem': Math.floor(Math.random() * 10) + 1,
                  'methodology': Math.floor(Math.random() * 15) + 1,
                  'literatureReview': Math.floor(Math.random() * 10) + 1,
                  'teamComposition': Math.floor(Math.random() * 10) + 1,
                  'feasibilityAndTimeline': Math.floor(Math.random() * 10) + 1,
                  'budgetJustification': Math.floor(Math.random() * 10) + 1,
                  'expectedOutcomes': Math.floor(Math.random() * 5) + 1,
                  'sustainabilityAndScalability': Math.floor(Math.random() * 5) + 1,
                }
              },
              reviewerB: {
                name: "Reviewer B",
                scores: {
                  'relevanceToNationalPriorities': Math.floor(Math.random() * 10) + 1,
                  'originalityAndInnovation': Math.floor(Math.random() * 15) + 1,
                  'clarityOfResearchProblem': Math.floor(Math.random() * 10) + 1,
                  'methodology': Math.floor(Math.random() * 15) + 1,
                  'literatureReview': Math.floor(Math.random() * 10) + 1,
                  'teamComposition': Math.floor(Math.random() * 10) + 1,
                  'feasibilityAndTimeline': Math.floor(Math.random() * 10) + 1,
                  'budgetJustification': Math.floor(Math.random() * 10) + 1,
                  'expectedOutcomes': Math.floor(Math.random() * 5) + 1,
                  'sustainabilityAndScalability': Math.floor(Math.random() * 5) + 1,
                }
              }
            });
          }
        } else {
          setError('Failed to load review data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [reviewId, isAuthenticated]);

  const handleScoreChange = (id: keyof ScoreData, score: number) => {
    setReviewCriteria(prev => 
      prev.map(criteria => 
        criteria.id === id 
          ? { ...criteria, scoreGiven: score } 
          : criteria
      )
    );
  };

  const calculateTotalScore = () => {
    return reviewCriteria.reduce((total, criteria) => 
      total + (criteria.scoreGiven || 0), 0
    );
  };

  const calculateMaxTotalScore = () => {
    return reviewCriteria.reduce((total, criteria) => 
      total + criteria.maxScore, 0
    );
  };

  const handleSaveProgress = async () => {
    if (!reviewData) return;

    try {
      setSaving(true);
      
      const scores: Partial<ScoreData> = {};
      reviewCriteria.forEach(criteria => {
        if (criteria.scoreGiven !== undefined) {
          scores[criteria.id] = criteria.scoreGiven;
        }
      });

      const progressData = {
        scores: Object.keys(scores).length > 0 ? scores : undefined,
        comments: reviewComments || undefined
      };

      const response = await saveReviewProgress(reviewData._id, progressData);
      
      if (response.success) {
        // Show success message (you might want to add a toast notification)
        console.log('Progress saved successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!reviewData) return;

    // Validate all scores are entered
    const allScoresEntered = reviewCriteria.every(criteria => 
      criteria.scoreGiven !== undefined
    );

    if (!allScoresEntered) {
      setError('Please enter scores for all criteria');
      return;
    }

    if (!reviewComments.trim()) {
      setError('Please provide review comments');
      return;
    }

    try {
      setSubmitting(true);
      
      const scores: ScoreData = {
        relevanceToNationalPriorities: 0,
        originalityAndInnovation: 0,
        clarityOfResearchProblem: 0,
        methodology: 0,
        literatureReview: 0,
        teamComposition: 0,
        feasibilityAndTimeline: 0,
        budgetJustification: 0,
        expectedOutcomes: 0,
        sustainabilityAndScalability: 0,
      };

      reviewCriteria.forEach(criteria => {
        scores[criteria.id] = criteria.scoreGiven || 0;
      });

      const response = await submitReview(reviewData._id, {
        scores,
        comments: reviewComments
      });

      if (response.success) {
        // Redirect to assignments page or show success message
        router.push('/reviewers/assignments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setReviewCriteria(prev => 
      prev.map(criteria => ({ ...criteria, scoreGiven: undefined }))
    );
    setReviewComments('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Handle loading states
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ReviewerLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/reviewers/assignments')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </ReviewerLayout>
    );
  }

  if (!reviewData) {
    return (
      <ReviewerLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Review not found</p>
          </div>
        </div>
      </ReviewerLayout>
    );
  }

  const isCompleted = reviewData.status === 'completed';
  const isReconciliation = reviewData.reviewType === 'reconciliation';

  return (
    <ReviewerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isCompleted ? 'Review Details' : 'Review Proposal'}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due: {formatDate(reviewData.dueDate)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reviewData.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : reviewData.status === 'overdue'
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reviewData.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {isReconciliation && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      RECONCILIATION REVIEW
                    </span>
                  )}
                </div>
              </div>
              <Link 
                href="/reviewers/review-guideline" 
                target="_blank" 
                className="bg-gray-100 px-4 py-2 rounded-lg text-purple-600 hover:text-purple-800 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Review Guidelines
              </Link>
            </div>
          </div>

          {/* Discrepancy Alert for Reconciliation Reviews */}
          {isReconciliation && previousScores && (
            <DiscrepancyAlert previousScores={previousScores} />
          )}

          {/* Previous Scores for Reconciliation */}
          {isReconciliation && previousScores && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Previous Review Scores</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">Criteria</th>
                      <th className="text-left py-3 font-semibold">Reviewer A</th>
                      <th className="text-left py-3 font-semibold">Reviewer B</th>
                      <th className="text-left py-3 font-semibold">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewCriteria.map((criteria) => {
                      const scoreA = previousScores.reviewerA.scores[criteria.id] || 0;
                      const scoreB = previousScores.reviewerB.scores[criteria.id] || 0;
                      const difference = Math.abs(scoreA - scoreB);
                      
                      return (
                        <tr key={criteria.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{criteria.name}</div>
                              <div className="text-sm text-gray-500">Max: {criteria.maxScore}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 rounded-full h-2" 
                                  style={{ width: `${(scoreA / criteria.maxScore) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{scoreA}/{criteria.maxScore}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 rounded-full h-2" 
                                  style={{ width: `${(scoreB / criteria.maxScore) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{scoreB}/{criteria.maxScore}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`font-medium ${
                              difference > criteria.maxScore * 0.3 
                                ? 'text-red-600' 
                                : difference > criteria.maxScore * 0.2 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                            }`}>
                              {difference}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Proposal Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b pb-2">Proposal Details</h2>
            
            {/* Project Title */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{reviewData.proposal.projectTitle}</h3>
            </div>

            {/* Submitter Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-700">Principal Investigator</h4>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{reviewData.proposal.submitter.academicTitle} {reviewData.proposal.submitter.name}</p>
                  <p className="text-sm text-gray-600">{reviewData.proposal.submitter.department.title}</p>
                  <p className="text-sm text-gray-600">{reviewData.proposal.submitter.faculty.title}</p>
                  <p className="text-sm text-gray-500">{reviewData.proposal.submitter.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-700">Proposal Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium capitalize">{reviewData.proposal.submitterType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium capitalize">{reviewData.proposal.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm font-medium">{formatDate(reviewData.proposal.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm font-medium">{formatCurrency(reviewData.proposal.estimatedBudget)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Content */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Problem Statement</h4>
                <p className="text-gray-600 leading-relaxed">{reviewData.proposal.problemStatement}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Research Objectives</h4>
                <p className="text-gray-600 leading-relaxed">{reviewData.proposal.objectives}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Methodology</h4>
                <p className="text-gray-600 leading-relaxed">{reviewData.proposal.methodology}</p>
              </div>

              {reviewData.proposal.expectedOutcomes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Expected Outcomes</h4>
                  <p className="text-gray-600 leading-relaxed">{reviewData.proposal.expectedOutcomes}</p>
                </div>
              )}

              {reviewData.proposal.workPlan && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Work Plan</h4>
                  <p className="text-gray-600 leading-relaxed">{reviewData.proposal.workPlan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Scoring Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-purple-700">
                {isCompleted ? 'Your Review Scores' : 'Proposal Scoring'}
              </h2>
              {isCompleted && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Score</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {reviewData.totalScore}/{calculateMaxTotalScore()}
                  </div>
                </div>
              )}
            </div>

            {/* Scoring Criteria */}
            <div className="space-y-4 mb-6">
              {reviewCriteria.map((criteria) => (
                <div key={criteria.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {criteria.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {criteria.description}
                      </p>
                      <span className="text-xs text-gray-500">Max Score: {criteria.maxScore}</span>
                    </div>
                    <div className="flex items-center ml-4">
                      {isCompleted ? (
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-700">
                            {reviewData.scores[criteria.id]}/{criteria.maxScore}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-600 rounded-full h-2" 
                              style={{ 
                                width: `${(reviewData.scores[criteria.id] / criteria.maxScore) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <input 
                          type="number"
                          min="0"
                          max={criteria.maxScore}
                          value={criteria.scoreGiven ?? ''}
                          onChange={(e) => {
                            const score = parseInt(e.target.value);
                            handleScoreChange(
                              criteria.id, 
                              isNaN(score) ? 0 : Math.min(score, criteria.maxScore)
                            );
                          }}
                          className="w-20 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={`0-${criteria.maxScore}`}
                        />
                      )}
                    </div>
                  </div>
                  
                  {!isCompleted && (
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 rounded-full h-2 transition-all duration-300" 
                        style={{ 
                          width: `${criteria.scoreGiven 
                            ? (criteria.scoreGiven / criteria.maxScore) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Score */}
            {!isCompleted && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Total Score</span>
                <span className="text-2xl font-bold text-purple-700">
                  {calculateTotalScore()}/{calculateMaxTotalScore()}
                </span>
              </div>
            )}

            {/* Review Comments */}
            <div className="mb-6">
              <label 
                htmlFor="review-comments" 
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Review Comments
              </label>
              {isCompleted ? (
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {reviewData.comments || 'No comments provided.'}
                  </p>
                </div>
              ) : (
                <textarea 
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
                  placeholder="Provide detailed review comments for the proposal..."
                />
              )}
            </div>

            {/* Action Buttons */}
            {!isCompleted && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleSaveProgress