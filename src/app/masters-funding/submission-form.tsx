"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Define TypeScript interfaces
interface FormData {
  fullName: string;
  matricNumber: string;
  programme: string;
  department: string;
  faculty: string;
  email: string;
  alternativeEmail: string;
  phoneNumber: string;
  projectTitle: string;
  problemStatement: string;
  objectives: string;
  methodology: string;
  innovation: string;
  impact: string;
  timeline: string;
  budget: string;
  proposalFile: File | null;
}

interface FormErrors {
  email: string;
  alternativeEmail: string;
}

export default function SubmissionForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    matricNumber: '',
    programme: '',
    department: '',
    faculty: '',
    email: '',
    alternativeEmail: '',
    phoneNumber: '',
    projectTitle: '',
    problemStatement: '',
    objectives: '',
    methodology: '',
    innovation: '',
    impact: '',
    timeline: '',
    budget: '',
    proposalFile: null
  });

  useEffect(() => {
    const retrievedInputs = localStorage.getItem("savedMastersInputs");
    if (retrievedInputs) {
      setFormData({...JSON.parse(retrievedInputs), proposalFile: null});
    }
  }, []);

  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
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
    if (name === 'email' || name === 'alternativeEmail') {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    localStorage.setItem(
      "savedMastersInputs",
      JSON.stringify({...formData, proposalFile: null})
    );
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Email validation on blur
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setFormErrors({
          ...formErrors,
          email: 'Please enter a valid email address'
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
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size should not exceed 5MB');
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
          proposalFile: file
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
          proposalFile: file
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Email validation before submission
    let hasErrors = false;
    const newErrors = { email: '', alternativeEmail: '' };
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    if (formData.alternativeEmail && !validateEmail(formData.alternativeEmail)) {
      newErrors.alternativeEmail = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    // Final file validation check
    if (!formData.proposalFile) {
      setFileError('Please upload your concept note document');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }
    
    console.log('Form submitted:', formData);
    
    localStorage.removeItem("savedMastersInputs");
    // Here you would typically send the data to your backend
    alert('Form submitted successfully!');
  };

  const clearForm = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("savedMastersInputs");
    setFormData({
      fullName: '',
      matricNumber: '',
      programme: '',
      department: '',
      faculty: '',
      email: '',
      alternativeEmail: '',
      phoneNumber: '',
      projectTitle: '',
      problemStatement: '',
      objectives: '',
      methodology: '',
      innovation: '',
      impact: '',
      timeline: '',
      budget: '',
      proposalFile: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-800 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Master&apos;s Funding Concept Note Submission</h1>
        <p className="text-purple-200 text-sm mt-1">Complete all required fields below</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Personal Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
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
                Matriculation Number *
              </label>
              <input
                type="text"
                name="matricNumber"
                value={formData.matricNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programme *
              </label>
              <select
                name="programme"
                value={formData.programme}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              >
                <option value="">Select an option</option>
                <option value="MSc">MSc</option>
                <option value="MA">MA</option>
                <option value="MEng">MEng</option>
                <option value="MPhil">MPhil</option>
                <option value="MBA">MBA</option>
                <option value="LLM">LLM</option>
                <option value="MPH">MPH</option>
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
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                required
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formErrors.email}
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
                Problem Statement and Justification (Max 200 words) *
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
                Objectives and Anticipated Outcomes *
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research-Informed Approach and Methodology (Max 250 words) *
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
                Innovation and Impact *
              </label>
              <textarea
                name="innovation"
                value={formData.innovation}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Implementation Plan and Timeline *
              </label>
              <textarea
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preliminary Budget Estimate *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  ₦
                </span>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="500,000.00"
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
              Upload Concept Note Document (Max 5 pages; PDF or DOC format) *
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
                  PDF or DOC up to 5MB (max 5 pages)
                </p>
                {formData.proposalFile && (
                  <p className="text-sm text-green-600 mt-2">
                    File selected: {formData.proposalFile.name}
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
              onClick={clearForm}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-4"
            >
              Clear form
            </button>
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
  );
}