"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResearcherProposalDetails } from '@/services/api';
import ResearcherLayout from '@/components/researchers/ResearcherLayout';
import { AlertCircle, ArrowLeft, Download, Clock } from 'lucide-react';
import Link from 'next/link';

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
  createdAt: string;
  updatedAt: string;
}

export default function ProposalDetails() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        const response = await getResearcherProposalDetails(proposalId);
        setProposal(response.data);
        console.log('Fetched proposal details:', response.data);
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
                          href={`/api/files/${proposal.cvFile}`}
                          download
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <Download className="h-5 w-5 text-purple-700 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Curriculum Vitae</p>
                            <p className="text-xs text-gray-500">Download CV</p>
                          </div>
                        </a>
                      )}
                      
                      {proposal.docFile && (
                        <a 
                          href={`/api/files/${proposal.docFile}`}
                          download
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <Download className="h-5 w-5 text-purple-700 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Full Proposal Document</p>
                            <p className="text-xs text-gray-500">Download Document</p>
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
