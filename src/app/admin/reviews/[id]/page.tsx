"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Loader2,
  User,
  Bot,
  FileText,
  Calendar,
  Award,
  MessageSquare,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { getProposalReviewDetailsById } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewScore {
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

interface Review {
  id: string;
  reviewType: 'ai' | 'human' | 'reconciliation';
  status: string;
  scores: ReviewScore;
  totalScore: number;
  comments: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  reviewer?: {
    name: string;
    email: string;
    academicTitle?: string;
    faculty?: { title: string; code: string };
    department?: { title: string; code: string };
  };
}

interface DiscrepancyInfo {
  hasDiscrepancy: boolean;
  overallScores: {
    scores: number[];
    max: number;
    min: number;
    avg: number;
    percentDifference: number;
  };
  criteriaDiscrepancies: {
    criterion: string;
    scores: number[];
    max: number;
    min: number;
    avg: number;
    percentDifference: number;
  }[];
  threshold: number;
}

interface ProposalReviewDetails {
  proposal: {
    id: string;
    projectTitle: string;
    submitterType: string;
    status: string;
    reviewStatus: string;
    createdAt: string;
    updatedAt: string;
    submitter: {
      name: string;
      email: string;
      academicTitle?: string;
      faculty?: { title: string; code: string };
      department?: { title: string; code: string };
    };
  };
  reviewSummary: {
    totalReviews: number;
    completedReviews: number;
    pendingReviews: number;
    hasAI: boolean;
    hasHuman: boolean;
    hasReconciliation: boolean;
  };
  reviews: {
    ai: Review[];
    human: Review[];
    reconciliation: Review[];
  };
  discrepancyInfo?: DiscrepancyInfo;
}

const criteriaLabels: { [key: string]: string } = {
  relevanceToNationalPriorities: 'Relevance to National Priorities',
  originalityAndInnovation: 'Originality and Innovation',
  clarityOfResearchProblem: 'Clarity of Research Problem',
  methodology: 'Methodology',
  literatureReview: 'Literature Review',
  teamComposition: 'Team Composition',
  feasibilityAndTimeline: 'Feasibility and Timeline',
  budgetJustification: 'Budget Justification',
  expectedOutcomes: 'Expected Outcomes',
  sustainabilityAndScalability: 'Sustainability and Scalability'
};

const criteriaMaxScores: { [key: string]: number } = {
  relevanceToNationalPriorities: 10,
  originalityAndInnovation: 15,
  clarityOfResearchProblem: 10,
  methodology: 15,
  literatureReview: 10,
  teamComposition: 10,
  feasibilityAndTimeline: 10,
  budgetJustification: 10,
  expectedOutcomes: 5,
  sustainabilityAndScalability: 5
};

export default function ProposalReviewDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;

  const [details, setDetails] = useState<ProposalReviewDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && proposalId) {
      loadProposalDetails();
    }
  }, [isAuthenticated, proposalId]);

  const loadProposalDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProposalReviewDetailsById(proposalId);
      setDetails(response.data);
    } catch (err) {
      console.error('Failed to load proposal details:', err);
      setError('Failed to load proposal review details');
    } finally {
      setIsLoading(false);
    }
  };

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <Bot size={16} className="text-purple-600" />;
      case 'human':
        return <User size={16} className="text-blue-600" />;
      case 'reconciliation':
        return <RefreshCw size={16} className="text-orange-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getReviewTypeLabel = (type: string) => {
    switch (type) {
      case 'ai':
        return 'AI Review';
      case 'human':
        return 'Human Review';
      case 'reconciliation':
        return 'Reconciliation Review';
      default:
        return 'Review';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock size={12} className="mr-1" />
            In Progress
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle size={12} className="mr-1" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const renderScoreBreakdown = (review: Review) => {
    return (
      <div className="space-y-3">
        {Object.entries(review.scores).map(([criterion, score]) => {
          const maxScore = criteriaMaxScores[criterion] || 10;
          const percentage = (score / maxScore) * 100;
          
          return (
            <div key={criterion}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {criteriaLabels[criterion] || criterion}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {score}/{maxScore}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">Total Score</span>
            <span className="text-lg font-bold text-purple-600">
              {review.totalScore}/100
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscrepancyAnalysis = () => {
    if (!details?.discrepancyInfo?.hasDiscrepancy) return null;

    const { discrepancyInfo } = details;

    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange