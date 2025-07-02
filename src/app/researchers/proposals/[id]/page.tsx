"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFullProposalStatus, getResearcherProposalDetails } from '@/services/api';
import ResearcherLayout from '@/components/researchers/ResearcherLayout';
import { AlertCircle, ArrowLeft, FileText, Clock } from 'lucide-react';
import Link from 'next/link';

interface AwardData {
  status: 'approved' | 'declined';
  feedbackComments: string;
  fundingAmount?: number;
}

interface FullProposalStatus {
  canSubmit: boolean;
  isApproved: boolean;
  hasSubmitted: boolean;
  isWithinDeadline: boolean;
  deadline: string;
  daysRemaining: number;
}

interface Proposal {
  _id: string;
  projectTitle: string;
  submitterType: string;
  problemStatement: string;
  objectives: string;
  methodology: string;
  expectedOutcomes?: string;
  workPlan?: string;
  estimatedBudget?: number;
  coInvestigators?: Array<{
    name: string;
    department?: string;
    faculty?: string;
  }>;
  cvFile?: string;
  docFile?: string;
  status: string;
  award?: AwardData;
  createdAt: string;
  updatedAt: string;
}

const useFullProposalStatus = (proposalId: string) => {
  const [status, setStatus] = useState<FullProposalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getFullProposalStatus(proposalId);
        if (response.success) {
          setStatus(response.data);
        }
      } catch (error) {
        console.error('Error fetching full proposal status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchStatus();
    }
  }, [proposalId]);

  return { status, loading };
};

const AwardPoster = ({ award }: { award: AwardData; projectTitle: string }) => {
  const isApproved = award.status === 'approved';
  
  return (
    <div className={`rounded-xl p-8 mb-6 relative overflow-hidden ${
      isApproved 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200' 
        : 'bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200'
    }`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        {isApproved ? (
          <div className="w-full h-full bg-green-500 rounded-full transform translate-x-16 -translate-y-16"></div>
        ) : (
          <div className="w-full h-full bg-red-500 rounded-full transform translate-x-16 -translate-y-16"></div>
        )}
      </div>
      
      <div className="relative z-10">
        {isApproved ? (
          <>
            {/* Approved Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Congratulations!</h2>
                <p className="text-green-700">Your proposal has been approved for the next stage</p>
              </div>
            </div>
            
            {/* Approved Details */}
            <div className="bg-white/60 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Award Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {award.fundingAmount && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">Funding Amount:</span>
                    <span className="text-lg font-bold text-green-600">₦{award.fundingAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {award.feedbackComments && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-600">Feedback:</span>
                  <p className="text-gray-700 mt-1 italic">&quot;{award.feedbackComments}&quot;</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Declined Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-800">Thanks for participating</h2>
                <p className="text-red-700">Your proposal was not selected for funding</p>
              </div>
            </div>
            
            {/* Declined Details */}
            <div className="bg-white/60 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-gray-700 mb-4">
                We appreciate the time and effort you put into your proposal. While it wasn&apos;t selected this time, 
                we encourage you to consider the feedback and apply again in the future.
              </p>
              {award.feedbackComments && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Feedback from Review Committee:</span>
                  <div className="mt-2 p-3 bg-red-50 rounded-md border-l-4 border-red-300">
                    <p className="text-gray-700 italic">&quot;{award.feedbackComments}&quot;</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FullProposalSubmissionBanner = ({ 
  proposalId, 
  fullProposalStatus 
}: { 
  proposalId: string; 
  fullProposalStatus: FullProposalStatus;
}) => {
  const { canSubmit, hasSubmitted, isWithinDeadline, deadline, daysRemaining } = fullProposalStatus;
  
  if (!fullProposalStatus.isApproved) return null;

  const deadlineDate = new Date(deadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (hasSubmitted) {
    return (
      <div className="rounded-xl p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-800">Full Proposal Submitted</h3>
            <p className="text-blue-700">Your complete proposal has been successfully submitted</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isWithinDeadline) {
    return (
      <div className="rounded-xl p-6 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mr-4">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Submission Deadline Passed</h3>
            <p className="text-gray-700">The deadline for full proposal submission was {formattedDeadline}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 mb-6 bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-800">Next Stage: Submit Full Proposal</h3>
          <p className="text-purple-700">Your proposal has been approved! Submit your complete proposal document.</p>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Submission Deadline:</span>
          <span className="text-lg font-bold text-purple-600">{formattedDeadline}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Days Remaining:</span>
          <span className={`text-lg font-bold ${daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'}`}>
            {daysRemaining} days
          </span>
        </div>
      </div>

      {canSubmit && (
        <Link 
          href={`/researchers/proposals/${proposalId}/submit-full`}
          className="inline-flex items-center bg-purple-800 hover:bg-purple-900 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Submit Full Proposal
        </Link>
      )}
    </div>
  );
};

export default function ProposalDetails() {
  const params = useParams();
  const proposalId = params.id as string;
  const { status: fullProposalStatus, loading: statusLoading } = useFullProposalStatus(proposalId);
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        const response = await getResearcherProposalDetails(proposalId);
        setProposal(response.data);
      } catch (err) {
        console.error('Error fetching proposal details:', err);
        setError('Failed to load proposal details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (proposalId) {
      fetchProposalDetails();
    }
  }, [proposalId]);
  
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
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <ResearcherLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/researchers/proposals" 
            className="flex items-center text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Proposals
          </Link>
        </div>
        
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
        ) : proposal ? (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {proposal.projectTitle || '(check doc file for title)'}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                      {formatStatus(proposal.status)}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Submitted: {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                </div>
                
                {proposal.status === 'revision_requested' && (
                  <div className="mt-4 md:mt-0">
                    <Link 
                      href={`/researchers/revise/${proposal._id}`}
                      className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Revise Proposal
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {proposal.award && (
            <AwardPoster award={proposal.award} projectTitle={proposal.projectTitle || 'Your Research Proposal'} />
          )}

          {proposal.award && fullProposalStatus && !statusLoading && (
          <FullProposalSubmissionBanner 
          proposalId={proposalId} 
          fullProposalStatus={fullProposalStatus} 
          />
        )}

            {/* Proposal Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                      <div className="w-1/2 py-4 px-1 text-center border-b-2 border-purple-800">
                        <span className="text-sm font-medium text-purple-800">Proposal Details</span>
                      </div>
                    </nav>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">Problem Statement</h2>
                      <p className="text-gray-700 whitespace-pre-line">{proposal.problemStatement}</p>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">Objectives</h2>
                      <p className="text-gray-700 whitespace-pre-line">{proposal.objectives}</p>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">Methodology</h2>
                      <p className="text-gray-700 whitespace-pre-line">{proposal.methodology}</p>
                    </div>
                    
                    {proposal.expectedOutcomes && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Expected Outcomes</h2>
                        <p className="text-gray-700 whitespace-pre-line">{proposal.expectedOutcomes}</p>
                      </div>
                    )}
                    
                    {proposal.workPlan && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Work Plan</h2>
                        <p className="text-gray-700 whitespace-pre-line">{proposal.workPlan}</p>
                      </div>
                    )}
                    
                    {proposal.estimatedBudget !== undefined && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Estimated Budget</h2>
                        <p className="text-gray-700">₦{proposal.estimatedBudget.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {proposal.coInvestigators && proposal.coInvestigators.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Co-Investigators</h2>
                        <ul className="list-disc pl-5">
                          {proposal.coInvestigators.map((person, index) => (
                            <li key={index} className="text-gray-700 mb-1">
                              {person.name}
                              {person.department && ` - ${person.department}`}
                              {person.faculty && `, ${person.faculty}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Documents</h2>
                  
                  {(proposal.cvFile || proposal.docFile) ? (
                    <div className="space-y-3">
                      {proposal.cvFile && (
                        <a 
                          href={proposal.cvFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <FileText className="h-5 w-5 text-purple-700 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Curriculum Vitae</p>
                            <p className="text-xs text-gray-500">View CV</p>
                          </div>
                        </a>
                      )}
                      
                      {proposal.docFile && (
                        <a 
                          href={proposal.docFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <FileText className="h-5 w-5 text-purple-700 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Full Proposal Document</p>
                            <p className="text-xs text-gray-500">View Document</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents attached to this proposal.</p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Status Timeline</h2>
                  <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-500"></div>
                      <p className="text-sm font-medium text-gray-800">Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(proposal.createdAt)}</p>
                    </div>
                    
                    {proposal.status !== 'submitted' && (
                      <div className="relative">
                        <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-yellow-500"></div>
                        <p className="text-sm font-medium text-gray-800">Under Review</p>
                        <p className="text-xs text-gray-500">Started review process</p>
                      </div>
                    )}
                    
                    {['approved', 'rejected', 'revision_requested'].includes(proposal.status) && (
                      <div className="relative">
                        <div className={`absolute -left-6 mt-1 w-4 h-4 rounded-full ${
                          proposal.status === 'approved' ? 'bg-green-500' : 
                          proposal.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                        <p className="text-sm font-medium text-gray-800">{formatStatus(proposal.status)}</p>
                        <p className="text-xs text-gray-500">{formatDate(proposal.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ResearcherLayout>
  );
}
