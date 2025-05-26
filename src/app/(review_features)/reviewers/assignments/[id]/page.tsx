"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Clock, AlertCircle, Save, Send, FileText, User } from 'lucide-react';
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

interface DiscrepancyInfo {
  message: string;
  conflictingReviews: Array<{
    reviewId: string;
    scores: ScoreData;
    totalScore: number;
    comments: string;
    submittedAt: string;
  }>;
  discrepancyAnalysis: {
    overallScoreRange: {
      highest: number;
      lowest: number;
      average: number;
      percentageDifference: number;
    };
    criteriaWithHighestDiscrepancy: Array<{
      criterion: string;
      scores: number[];
      averageScore: number;
      percentageDifference: number;
    }>;
  };
  reconciliationGuidance: {
    purpose: string;
    instruction: string;
    weightage: string;
  };
}

interface ReviewResponseData {
  review: ReviewData;
  discrepancyInfo?: DiscrepancyInfo;  
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
  const [discrepancyInfo, setDiscrepancyInfo] = useState<DiscrepancyInfo | null>(null);

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
          const { review, discrepancyInfo } = response.data as ReviewResponseData;
          setReviewData(review);
          setReviewComments(review.comments || '');

          // Set discrepancy info if available
        if (discrepancyInfo) {
          setDiscrepancyInfo(discrepancyInfo);
        }
          
          // Update criteria with existing scores
          setReviewCriteria(prev => 
            prev.map(criteria => ({
              ...criteria,
              scoreGiven: review.scores[criteria.id] || undefined
            }))
          );
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
          {isReconciliation && discrepancyInfo && (
            <DiscrepancyAlert 
            discrepancyInfo={discrepancyInfo}
            totalCriteria={reviewCriteria.length}
            />
      )}

          {isReconciliation && discrepancyInfo && (
  <>
    {/* Reconciliation Guidance Card */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Reconciliation Review Guidance</h2>
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-blue-700">Purpose:</h3>
          <p className="text-blue-600">{discrepancyInfo.reconciliationGuidance.purpose}</p>
        </div>
        <div>
          <h3 className="font-semibold text-blue-700">Instructions:</h3>
          <p className="text-blue-600">{discrepancyInfo.reconciliationGuidance.instruction}</p>
        </div>
        <div>
          <h3 className="font-semibold text-blue-700">Scoring Weight:</h3>
          <p className="text-blue-600">{discrepancyInfo.reconciliationGuidance.weightage}</p>
        </div>
      </div>
    </div>

    {/* Discrepancy Analysis */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Discrepancy Analysis</h2>
      
      {/* Overall Score Range */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Overall Score Range</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">{discrepancyInfo.discrepancyAnalysis.overallScoreRange.highest}</div>
            <div className="text-gray-600">Highest</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-red-600">{discrepancyInfo.discrepancyAnalysis.overallScoreRange.lowest}</div>
            <div className="text-gray-600">Lowest</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{discrepancyInfo.discrepancyAnalysis.overallScoreRange.average}</div>
            <div className="text-gray-600">Average</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-orange-600">{discrepancyInfo.discrepancyAnalysis.overallScoreRange.percentageDifference}%</div>
            <div className="text-gray-600">Difference</div>
          </div>
        </div>
      </div>

      {/* Top Discrepancy Criteria */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Criteria with Highest Discrepancies</h3>
        <div className="space-y-3">
          {discrepancyInfo.discrepancyAnalysis.criteriaWithHighestDiscrepancy.map((criteria, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-red-800">{criteria.criterion}</h4>
                <span className="text-red-600 font-bold">{criteria.percentageDifference}% difference</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>Scores: {criteria.scores.join(', ')}</div>
                <div>Average: {criteria.averageScore}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Previous Review Scores with Real Data */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Previous Review Scores</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 font-semibold">Criteria</th>
              {discrepancyInfo.conflictingReviews.map((review, index) => (
                <th key={index} className="text-left py-3 font-semibold">{review.reviewId}</th>
              ))}
              <th className="text-left py-3 font-semibold">Score Range</th>
            </tr>
          </thead>
          <tbody>
            {reviewCriteria.map((criteria) => {
              const scores = discrepancyInfo.conflictingReviews.map(review => 
                review.scores[criteria.id] || 0
              );
              const minScore = Math.min(...scores);
              const maxScore = Math.max(...scores);
              const difference = maxScore - minScore;
              
              return (
                <tr key={criteria.id} className="border-b">
                  <td className="py-3">
                    <div>
                      <div className="font-medium">{criteria.name}</div>
                      <div className="text-sm text-gray-500">Max: {criteria.maxScore}</div>
                    </div>
                  </td>
                  {scores.map((score, index) => (
                    <td key={index} className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`rounded-full h-2 ${
                              index === 0 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(score / criteria.maxScore) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{score}/{criteria.maxScore}</span>
                      </div>
                    </td>
                  ))}
                  <td className="py-3">
                    <span className={`font-medium ${
                      difference > criteria.maxScore * 0.3 
                        ? 'text-red-600' 
                        : difference > criteria.maxScore * 0.2 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {minScore}-{maxScore} ({difference} diff)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Previous Comments */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">Previous Review Comments</h3>
        <div className="space-y-4">
          {discrepancyInfo.conflictingReviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">{review.reviewId}</h4>
                <div className="text-sm text-gray-500">
                  Total Score: {review.totalScore}/{calculateMaxTotalScore()}
                </div>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">
                {review.comments || 'No comments provided.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
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
                  onClick={handleSaveProgress}
                  disabled={saving}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Progress
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-medium">
                    Review completed on {reviewData.completedAt ? formatDate(reviewData.completedAt) : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ReviewerLayout>
  );
};

export default ProposalReviewForm;