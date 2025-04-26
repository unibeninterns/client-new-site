"use client"
import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import Header from '@/components/header';
import Link from 'next/link';

// Define TypeScript interfaces
interface FormData {
  fullName: string;
  academicRank: string;
  department: string;
  faculty: string;
  unibenEmail: string;
  alternativeEmail: string;
  phoneNumber: string;
  coInvestigators: string;
  coInvestigatorsDept: string;
  projectTitle: string;
  problemStatement: string;
  researchObjectives: string;
  methodology: string;
  expectedOutcomes: string;
  workPlan: string;
  estimatedBudget: string;
  cvFile: File | null;
}

interface FormErrors {
  unibenEmail: string;
  alternativeEmail: string;
}

export default function TETFundForm() {
  const [formData, setFormData] = useState<FormData>({
      fullName: '',
      academicRank: '',
      department: '',
      faculty: '',
      unibenEmail: '',
      alternativeEmail: '',
      phoneNumber: '',
      coInvestigators: '',
      coInvestigatorsDept: '',
      projectTitle: '',
      problemStatement: '',
      researchObjectives: '',
      methodology: '',
      expectedOutcomes: '',
      workPlan: '',
      estimatedBudget: '',
      cvFile: null
    });

  useEffect(() => {
    const retreivedInputs = localStorage.getItem("savedInputs");
    const returnValue =  retreivedInputs ? JSON.parse(retreivedInputs) :  {
      fullName: '',
      academicRank: '',
      department: '',
      faculty: '',
      unibenEmail: '',
      alternativeEmail: '',
      phoneNumber: '',
      coInvestigators: '',
      coInvestigatorsDept: '',
      projectTitle: '',
      problemStatement: '',
      researchObjectives: '',
      methodology: '',
      expectedOutcomes: '',
      workPlan: '',
      estimatedBudget: '',
      cvFile: null
    }
    setFormData(returnValue)
  }, [])

  const [formErrors, setFormErrors] = useState<FormErrors>({
    unibenEmail: '',
    alternativeEmail: ''
  });

  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors when user is typing
    if (name === 'unibenEmail' || name === 'alternativeEmail') {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    localStorage.setItem(
      "savedInputs",
      JSON.stringify({...formData, cvFile : null})
    )
  };

  // Validate UNIBEN email (must end with @uniben.edu)
  const validateUnibenEmail = (email: string): boolean => {
    const unibenEmailRegex = /^[a-zA-Z0-9._%+-]+@uniben\.edu$/;
    return unibenEmailRegex.test(email);
  };

  // Validate regular email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Email validation on blur
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unibenEmail' && value) {
      if (!validateUnibenEmail(value)) {
        setFormErrors({
          ...formErrors,
          unibenEmail: 'Please enter a valid UNIBEN email address ending with @uniben.edu'
        });
      }
    } else if (name === 'alternativeEmail' && value) {
      if (!validateEmail(value)) {
        setFormErrors({
          ...formErrors,
          alternativeEmail: 'Please enter a valid email address'
        });
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Reset error
    setFileError('');
    
    // Check file type
    const acceptedFormats = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!acceptedFormats.includes(file.type)) {
      setFileError('Only PDF or DOC/DOCX files are accepted');
      return false;
    }
    
    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size should not exceed 2MB');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFormData({
          ...formData,
          cvFile: file
        });
      } else {
        // Clear the file input
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
        setFormData({
          ...formData,
          cvFile: file
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Email validation before submission
    let hasErrors = false;
    const newErrors = { unibenEmail: '', alternativeEmail: '' };
    
    if (!validateUnibenEmail(formData.unibenEmail)) {
      newErrors.unibenEmail = 'Please enter a valid UNIBEN email address ending with @uniben.edu';
      hasErrors = true;
    }
    
    if (formData.alternativeEmail && !validateEmail(formData.alternativeEmail)) {
      newErrors.alternativeEmail = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    // Final file validation check
    if (!formData.cvFile) {
      setFileError('Please upload your CV document');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }
    
    console.log('Form submitted:', formData);
    
    localStorage.removeItem("savedInputs")
    // Here you would typically send the data to your backend
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-800 text-white px-6 py-4">
            <h1 className="text-xl font-semibold">TETFund IBR Concept Note Submission Form</h1>
            <p className="text-purple-200 text-sm mt-1">Complete all required fields below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name of Lead Researcher *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Title/Rank *
                  </label>
                  <select
                    name="academicRank"
                    value={formData.academicRank}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  >
                    <option value="">Select an option</option>
                    <option value="Assistant Lecturer">Assistant Lecturer</option>
                    <option value="Lecturer II">Lecturer II</option>
                    <option value="Lecturer I">Lecturer I</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty *
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UNIBEN Email Address *
                  </label>
                  <input
                    type="email"
                    name="unibenEmail"
                    value={formData.unibenEmail}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border ${formErrors.unibenEmail ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="username@uniben.edu"
                  />
                  {formErrors.unibenEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.unibenEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Email Address (optional)
                  </label>
                  <input
                    type="email"
                    name="alternativeEmail"
                    value={formData.alternativeEmail}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border ${formErrors.alternativeEmail ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.alternativeEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.alternativeEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Research Team Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Research Team</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name(s) of Co-Investigator(s) (if applicable)
                  </label>
                  <textarea
                    name="coInvestigators"
                    value={formData.coInvestigators}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    placeholder="Enter names separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department(s) and Faculty(ies) of Co-Investigator(s)
                  </label>
                  <textarea
                    name="coInvestigatorsDept"
                    value={formData.coInvestigatorsDept}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    placeholder="Format: Name - Department, Faculty"
                  />
                </div>
              </div>
            </div>

            {/* Project Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Project Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background and Problem Statement (Max 200 words) *
                  </label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.problemStatement.split(' ').filter(Boolean).length}/200 words
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Research Objectives (Clear and measurable) *
                  </label>
                  <textarea
                    name="researchObjectives"
                    value={formData.researchObjectives}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Methodology Overview (Max 250 words) *
                  </label>
                  <textarea
                    name="methodology"
                    value={formData.methodology}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.methodology.split(' ').filter(Boolean).length}/250 words
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Outcomes and Impact *
                  </label>
                  <textarea
                    name="expectedOutcomes"
                    value={formData.expectedOutcomes}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brief Work Plan (Highlight main activities) *
                  </label>
                  <textarea
                    name="workPlan"
                    value={formData.workPlan}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Budget Summary (Indicative figure only) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      ₦
                    </span>
                    <input
                      type="text"
                      name="estimatedBudget"
                      value={formData.estimatedBudget}
                      onChange={handleInputChange}
                      required
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      placeholder="1,000,000.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Upload Section</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Short CV of Lead Researcher (Max 2 pages; PDF or DOC format) *
                </label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} ${fileError ? 'border-red-300' : ''} border-dashed rounded-md`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <Upload className={`mx-auto h-12 w-12 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Upload a file</span>
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
                      PDF or DOC up to 2MB (max 2 pages)
                    </p>
                    {formData.cvFile && (
                      <p className="text-sm text-green-600 mt-2">
                        File selected: {formData.cvFile.name}
                      </p>
                    )}
                    {fileError && (
                      <div className="flex items-center mt-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fileError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DRID UNIBEN. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            For technical support, please contact: <Link href='mailto:drid@uniben.edu' className='text-blue-500' title='send email'>drid@uniben.edu</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}