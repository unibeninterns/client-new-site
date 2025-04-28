"use client";

import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function DocumentUploader() {
  const [document, setDocument] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setDocument(file);
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
        setDocument(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document) {
      setFileError('Please upload your concept note document');
      return;
    }
    
    // Simulate submission
    setIsSubmitting(true);
    
    // Here you would typically send the file to your backend
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    console.log('Document submitted:', document);
  };

  const resetForm = () => {
    setDocument(null);
    setFileError('');
    setIsSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-800 text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Master&apos;s Funding Concept Note Submission</h1>
        </div>
        <div className="p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Submission Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your concept note has been submitted successfully. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={resetForm}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-800 hover:bg-purple-900"
          >
            Submit Another Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-800 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Master&apos;s Funding Concept Note Submission</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <p className="text-gray-700 mb-6">
            Please upload your complete concept note document (maximum 5 pages excluding appendix).
            Ensure your document includes all required sections as outlined in the submission guidelines.
          </p>
          
          <div 
            className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 ${
              isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
            } ${fileError ? 'border-red-300' : ''} border-dashed rounded-md`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-3 text-center">
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
                PDF or DOC/DOCX up to 5MB (max 5 pages excluding appendix)
              </p>
              {document && (
                <div className="mt-4 text-sm text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>File selected: {document.name}</span>
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
            className={`inline-flex items-center justify-center py-2 px-6 border border-transparent text-base font-medium rounded-md text-white ${
              !document || isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-900'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Concept Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}