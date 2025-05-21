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
  const proposalId = params.proposalId as string;
  
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
                    {proposal.projectTitle || 'Untitled Proposal'}
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
                      <div className="w-1/2 py-4 px-1 text-center">
                        <span className="text-sm font-medium text-gray-500">Review Status</span>
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
                      <p className="text-gray-700 whitespace-pre-line