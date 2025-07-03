"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Header from "@/components/header";
import Link from 'next/link';
import { getFullProposalStatus, submitFullProposal } from '@/services/api';
import ResearcherLayout from '@/components/researchers/ResearcherLayout';
import { useAuth } from '@/contexts/AuthContext';

interface EligibilityData {
    isApproved: boolean;
    hasSubmitted: boolean;
    isWithinDeadline: boolean;
    daysRemaining?: number;
  }

export default function SubmitFullProposalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const proposalId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  // Agreement state
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showFullGuidelines, setShowFullGuidelines] = useState(false);
  
  // File states
  const [document, setDocument] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState('');
  
  // Eligibility check states
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);

  // Check if user can submit full proposal
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await getFullProposalStatus(proposalId);
                if (response.success) {
          setEligibilityData(response.data);
          setCanSubmit(response.data.canSubmit);
        } else {
          setSubmitError('Failed to check submission eligibility');
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
        setSubmitError('Failed to check submission eligibility');
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [proposalId]);

  // File validation and handling
  const validateFile = (file: File): boolean => {
    setFileError('');
    
    const acceptedFormats = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!acceptedFormats.includes(file.type)) {
      setFileError('Only PDF or DOC/DOCX files are accepted');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size should not exceed 10MB');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setDocument(file);
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setDocument(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document) {
      setFileError('Please upload your full proposal document');
      return;
    }
    
    if (!user?.id) {
    setSubmitError('User not authenticated');
    return;
  }

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const formData = new FormData();
      formData.append('docFile', document);
      formData.append('proposalId', proposalId);
      formData.append('userId', user.id);

      const response = await submitFullProposal(formData);
      
      if (response.success) {
        setIsSubmitted(true);
        // Redirect back to proposal page after short delay
        setTimeout(() => {
          router.push(`/researchers/proposals/${proposalId}`);
        }, 3000);
      } else {
        setSubmitError(response.message || 'Failed to submit your full proposal. Please try again.');
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitError('Failed to submit your full proposal. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto h-8 w-8 text-purple-600 mb-4" />
              <p className="text-gray-600">Checking submission eligibility...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not eligible to submit
  if (!canSubmit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-800 text-white px-6 py-4">
              <h1 className="text-xl font-semibold">Full Proposal Submission</h1>
            </div>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Cannot Submit Full Proposal</h2>
              <div className="text-gray-600 mb-6">
                {!eligibilityData?.isApproved && (
                  <p className="mb-2">Your proposal has not been approved yet.</p>
                )}
                {eligibilityData?.hasSubmitted && (
                  <p className="mb-2">You have already submitted a full proposal for this project.</p>
                )}
                {!eligibilityData?.isWithinDeadline && (
                  <p className="mb-2">The submission deadline (July 31, 2025) has passed.</p>
                )}
              </div>
              <Link 
                href={`/researchers/proposals/${proposalId}`}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Proposal
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-800 text-white px-6 py-4">
              <h1 className="text-xl font-semibold">Full Proposal Submission</h1>
            </div>
            <div className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Submission Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your full proposal has been submitted successfully. You will receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting you back to your proposal...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ResearcherLayout>
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="max-w-4xl mx-auto mb-4">
          <Link 
            href={`/researchers/proposals/${proposalId}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposal
          </Link>
        </div>

        {/* Deadline Warning */}
        {eligibilityData?.daysRemaining && eligibilityData.daysRemaining <= 7 && (
          <div className="max-w-4xl mx-auto mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                <strong>Reminder:</strong> Only {eligibilityData.daysRemaining} days remaining to submit your full proposal (Deadline: July 31, 2025)
              </p>
            </div>
          </div>
        )}

        {/* Guidelines Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-purple-800 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Full Proposal Submission Guidelines</h1>
          </div>
          
          <div className="p-6 text-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Institution Based Research (IBR) Research Proposal Template/Format
            </h2>
            <p className="mb-4 text-gray-700">
              Directorate of Research, Innovation and Development (DRID), University of Benin, Benin City.
            </p>

            {showFullGuidelines ? (
              <>
                <p className="mb-6 text-gray-700">
                  Your full proposal document must include all the following sections:
                </p>

                <div className="space-y-4 text-gray-800">
                  <div className="border-l-4 border-purple-200 pl-4">
                    <h3 className="font-semibold text-purple-800">Principal Researcher/Investigator Information:</h3>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                      <li>Name</li>
                      <li>Institution</li>
                      <li>Department</li>
                      <li>Telephone Number</li>
                      <li>Email Address</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-200 pl-4">
                    <h3 className="font-semibold text-purple-800">Co-Researcher(s) (if any):</h3>
                    <p className="text-gray-700 mt-1">List names of all co-researchers</p>
                  </div>

                  <div className="border-l-4 border-purple-200 pl-4">
                    <h3 className="font-semibold text-purple-800">Required Sections:</h3>
                    <ol className="list-decimal list-inside ml-4 mt-2 text-gray-700 space-y-1">
                      <li>Project Title</li>
                      <li>Executive Summary</li>
                      <li>Introduction</li>
                      <li>Problem Statement/Justification</li>
                      <li>Objective(s) of the Study</li>
                      <li>Literature Review</li>
                      <li>Methodology (Include description of study area/site/subjects, data collection and data analysis)</li>
                      <li>Results (Expected outputs/Results)</li>
                      <li>Work Plan/Time Frame (Provide activity by activity in the form of a GANTT Chart)</li>
                      <li>Budget (Provide a budget break-down by activity/line item)</li>
                      <li>References</li>
                    </ol>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Important Submission Details:</h3>
                  <ul className="list-disc list-inside space-y-1 text-purple-700">
                    <li><strong>Deadline:</strong> Thursday, 31st July 2025.</li>
                    <li><strong>File Format:</strong> PDF, DOC, or DOCX only.</li>
                    <li><strong>File Size:</strong> Maximum 10MB.</li>
                    <li>For inquiries, contact the DRID Office or email <a href="mailto:drid@uniben.edu" className="text-purple-800 underline">drid@uniben.edu</a></li>
                  </ul>
                </div>

                <button 
                  onClick={() => setShowFullGuidelines(false)}
                  className="mt-6 text-purple-600 hover:text-purple-800 underline"
                >
                  Hide detailed guidelines
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700">
                  Please prepare your full research proposal document following the IBR Research Proposal Template format.
                </p>
                <p className="text-gray-700 mb-4">
                  Your document must include all required sections: principal researcher information, co-researchers, project title, executive summary, introduction, problem statement, objectives, literature review, methodology, expected results, work plan with GANTT chart, detailed budget breakdown, and references.
                </p>
                <button 
                  onClick={() => setShowFullGuidelines(true)}
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  View detailed submission guidelines
                </button>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-800">
                  I confirm that I have read and understood the submission guidelines and my proposal follows the IBR Research Proposal Template format
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form and Upload Section */}
        {agreementChecked && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-800 text-white px-6 py-4">
              <h1 className="text-xl font-semibold">Submit Full Research Proposal</h1>
            </div>
            
            {submitError && (
              <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50 mx-6 mt-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-600">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Document Upload</h2>
                <p className="text-gray-700 mb-6">
                  Upload your complete research proposal document following the IBR Research Proposal Template format.
                  Ensure all required sections are included and properly formatted.
                </p>
                
                <div 
                  className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 transition-all duration-200 ${
                    isDragging 
                      ? 'border-purple-500 bg-purple-50' 
                      : document 
                        ? 'border-green-400 bg-green-50' 
                        : fileError 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 bg-white'
                  } border-dashed rounded-md`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-3 text-center">
                    {document ? (
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    ) : (
                      <Upload className={`mx-auto h-12 w-12 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                    )}
                    
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>{document ? 'Replace file' : 'Upload a file'}</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      PDF or DOC/DOCX up to 10MB
                    </p>
                    
                    {document && (
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <div className="text-sm text-green-800 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">File selected: {document.name}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Size: {(document.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    
                    {fileError && (
                      <div className="flex items-center justify-center mt-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fileError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={!document || isSubmitting}
                  className={`inline-flex items-center justify-center py-3 px-8 border border-transparent text-base font-medium rounded-md text-white transition-all duration-200 ${
                    !document || isSubmitting 
                      ? 'bg-purple-400 cursor-not-allowed' 
                      : 'bg-purple-800 hover:bg-purple-900 transform hover:scale-105'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Full Proposal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DRID UNIBEN. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            For technical support, please contact: <Link href="mailto:drid@uniben.edu" className="text-blue-500" title="send email">drid@uniben.edu</Link>
          </p>
        </div>
      </footer>
    </div>
    </ResearcherLayout>
  );
}