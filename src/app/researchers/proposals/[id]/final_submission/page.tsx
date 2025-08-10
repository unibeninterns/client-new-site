"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Send, Loader2, ArrowLeft, FileText, Clock, Mail } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Header from "@/components/header";
import Link from 'next/link';
import { getFinalSubmissionStatus, submitFinalSubmission } from '@/services/api';
import ResearcherLayout from '@/components/researchers/ResearcherLayout';
import { useAuth } from '@/contexts/AuthContext';

interface EligibilityData {
  isApproved: boolean;
  hasSubmitted: boolean;
  isWithinDeadline: boolean;
  daysRemaining?: number;
  reviewComments?: string;
}

export default function SubmitFinalPage() {
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

  // Check if user can submit final submission
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await getFinalSubmissionStatus(proposalId);
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
    
    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size should not exceed 15MB');
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
      setFileError('Please upload your final submission document');
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

      const response = await submitFinalSubmission(formData);
      
      if (response.success) {
        setIsSubmitted(true);
        // Redirect back to proposal page after short delay
        setTimeout(() => {
          router.push(`/researchers/proposals/${proposalId}`);
        }, 5000);
      } else {
        setSubmitError(response.message || 'Failed to submit your final submission. Please try again.');
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitError('Failed to submit your final submission. Please try again later.');
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
              <p className="text-gray-600">Checking final submission eligibility...</p>
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
              <h1 className="text-xl font-semibold">Final Submission</h1>
            </div>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Cannot Submit Final Submission</h2>
              <div className="text-gray-600 mb-6">
                {!eligibilityData?.isApproved && (
                  <p className="mb-2">Your full proposal has not been approved yet.</p>
                )}
                {eligibilityData?.hasSubmitted && (
                  <p className="mb-2">You have already submitted your final submission for this project.</p>
                )}
                {!eligibilityData?.isWithinDeadline && (
                  <p className="mb-2">The final submission deadline (August 15, 2025) has passed.</p>
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
              <h1 className="text-xl font-semibold">Final Submission</h1>
            </div>
            <div className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Digital Submission Successful!</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                  <div className="text-left">
                    <p className="text-yellow-800 font-medium mb-2">Important Reminder:</p>
                    <p className="text-yellow-700">
                      You still need to submit the <strong>physical printed documents</strong> at the DRID office 
                      before the deadline (August 15, 2025). This digital submission does not replace the 
                      physical submission requirement.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Your digital final submission has been received successfully. You will receive a confirmation email shortly.
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
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">
                  <strong>Urgent:</strong> Only {eligibilityData.daysRemaining} days remaining for final submission (Deadline: August 15, 2025)
                </p>
              </div>
            </div>
          )}

          {/* Review Comments Section */}
          {eligibilityData?.reviewComments && (
            <div className="max-w-4xl mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Review Comments & Instructions</h3>
                  <div className="text-blue-700 whitespace-pre-wrap bg-white p-4 rounded border">
                    {eligibilityData.reviewComments}
                  </div>
                  <p className="text-blue-600 text-sm mt-2 font-medium">
                    Please follow all instructions and guidelines provided in the review comments above for your final submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-purple-800 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Final Submission Guidelines</h1>
              <p className="text-purple-100 mt-1">Digital Submission Portal</p>
            </div>
            
            <div className="p-6 text-gray-800">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400 p-6 mb-6 rounded-r-lg">
                <h2 className="text-xl font-semibold mb-3 text-purple-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Digital Final Submission Portal
                </h2>
                <p className="text-gray-700 mb-4">
                  This is where you submit the digital version of your final submission and all corresponding documents. 
                  The digital submission serves as the electronic copy of the physical documents you will also need to 
                  submit at the DRID office.
                </p>
                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800 font-medium mb-2">📅 Important Deadline Information:</p>
                  <p className="text-gray-700">
                    <strong>Final Submission Deadline:</strong> Friday, 15th August, 2025<br/>
                    This deadline applies to both digital (online) and physical submissions.
                  </p>
                </div>
              </div>

              {showFullGuidelines ? (
                <>
                  <div className="space-y-6 text-gray-800">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="font-bold text-red-800 text-lg mb-3 flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Dual Submission Requirement
                      </h3>
                      <p className="text-red-700 mb-3">
                        <strong>You must complete BOTH submissions:</strong>
                      </p>
                      <ol className="list-decimal list-inside text-red-700 space-y-2 ml-4">
                        <li><strong>Digital Submission</strong> - Complete this online form (what you&apos;re doing now)</li>
                        <li><strong>Physical Submission</strong> - Submit printed documents at the DRID office</li>
                      </ol>
                      <p className="text-red-600 font-medium mt-3">
                        The digital submission does NOT replace the physical submission requirement. Both are mandatory.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-200 pl-6">
                      <h3 className="font-semibold text-purple-800 text-lg mb-4">Required Documents for Final Submission:</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">1. Lead Researcher Form</h4>
                          <p className="text-gray-700 mb-2">
                            Complete the attached form neatly using your computer and attach a recent coloured passport photograph. 
                            The link to this form is provided in the review comments above.
                          </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">2. Full Proposal in TETFund Format</h4>
                          <p className="text-gray-700 mb-2">
                            Add a copy of your full proposal following the TETFund format. Please refer to the link 
                            in the review comments for the specific TETFund format rules and requirements.
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">3. Supporting Documents</h4>
                          <p className="text-gray-700 mb-2">Include the following attachments:</p>
                          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                            <li>Your current Curriculum Vitae (CV)</li>
                            <li>Appointment letter</li>
                            <li>Confirmation of employment letter</li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">4. Co-Researchers Confirmation</h4>
                          <p className="text-gray-700 mb-2">
                            As part of your final submission, kindly confirm and provide details of your co-researchers 
                            (if any) including their names, institutions, and roles in the project.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        DRID Contact Information
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> <a href="mailto:drid@uniben.edu" className="text-purple-600 underline">drid@uniben.edu</a></p>
                        <p><strong>Office:</strong> Directorate of Research, Innovation and Development (DRID)</p>
                        <p><strong>Institution:</strong> University of Benin, Benin City</p>
                        <p className="text-sm text-gray-600 mt-3">
                          For any questions or clarifications regarding the submission process, please contact the DRID office.
                        </p>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-4">Submission Requirements Summary:</h3>
                      <ul className="space-y-2 text-red-700">
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span><strong>File Format:</strong> PDF, DOC, or DOCX only (Maximum 15MB)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span><strong>Content:</strong> Single comprehensive document containing all required components</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span><strong>Physical Submission:</strong> Still required at DRID office by the same deadline</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span><strong>Deadline:</strong> Friday, 15th August, 2025 (applies to both digital and physical)</span>
                        </li>
                      </ul>
                    </div>
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
                    Please prepare your comprehensive final submission document that includes all required components as specified in the review comments and guidelines.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium mb-2">Remember:</p>
                    <p className="text-yellow-700 text-sm">
                      This digital submission is in addition to the physical documents you must submit at the DRID office. 
                      Both submissions are required and must be completed by August 15, 2025.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowFullGuidelines(true)}
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    View detailed submission requirements and guidelines
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
                    I confirm that I have read and understood all submission requirements, followed the instructions in the review comments, 
                    and understand that I must also submit physical documents at the DRID office by the deadline
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form and Upload Section */}
          {agreementChecked && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-800 text-white px-6 py-4">
                <h1 className="text-xl font-semibold">Submit Final Submission (Digital Version)</h1>
                <p className="text-purple-100 text-sm">Upload your comprehensive final submission document</p>
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
                  <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Final Submission Document Upload</h2>
                  <p className="text-gray-700 mb-6">
                    Upload your complete final submission document containing all required components: Lead Researcher Form with photo, 
                    TETFund format proposal, supporting documents (CV, appointment letter, employment confirmation), and 
                    co-researchers information.
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
                        PDF or DOC/DOCX up to 15MB
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
                        Submit Final Submission (Digital)
                      </>
                    )}
                  </button>
                </div>

                {/* Final reminder */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-yellow-800 text-sm">
                      <p className="font-medium mb-1">Final Reminder:</p>
                      <p>
                        After completing this digital submission, you must still submit the physical printed documents 
                        at the DRID office before August 15, 2025. Contact <a href="mailto:drid@uniben.edu" className="underline">drid@uniben.edu</a> for any questions.
                      </p>
                    </div>
                  </div>
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
              For technical support, please contact: <a href="mailto:drid@uniben.edu" className="text-blue-500">drid@uniben.edu</a>
            </p>
          </div>
        </footer>
      </div>
    </ResearcherLayout>
  );
}