"use client";

import { useState } from 'react';
import Header from "@/components/header";
import SubmissionForm from './submission-form';

export default function MastersFundingPage() {
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [showFullGuidelines, setShowFullGuidelines] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Guidelines Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-purple-800 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Submission Guidelines</h1>
          </div>
          
          <div className="p-6 text-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Pilot Seed Funding for Research-Driven Innovation
            </h2>
            <p className="mb-4 text-gray-700">
              Directorate of Research, Innovation and Development (DRID), University of Benin, Benin City.
            </p>
            <p className="mb-4 font-medium text-gray-800">
              <strong>Concept Note Submission Template (Master&apos;s Students Only)</strong>
            </p>

            {showFullGuidelines ? (
              <>
                <p className="mb-6 text-gray-700">
                  Please complete all fields clearly and accurately. Maximum of 5 pages excluding the budget appendix.
                </p>

                <ol className="list-decimal list-inside space-y-6 text-gray-800">
                  {/* Full guidelines content */}
                  <li>
                    <strong className="text-purple-800">Project Title:</strong> 
                    <span className="block mt-1 text-gray-700">Provide a clear and descriptive title for your project.</span>
                  </li>
                  {/* More list items... */}
                  <li>
                    <strong className="text-purple-800">Lead Researcher Information:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2 text-gray-700">
                      <li>Full Name</li>
                      <li>Matriculation Number</li>
                      <li>Programme (e.g., MSc, MA, LLM)</li>
                      <li>Department and Faculty</li>
                      <li>Email Address</li>
                      <li>Phone Number</li>
                    </ul>
                  </li>
                  {/* More guidelines... */}
                </ol>

                <button 
                  onClick={() => setShowFullGuidelines(false)}
                  className="mt-6 text-purple-600 hover:text-purple-800 underline"
                >
                  Hide full guidelines
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700">
                  Please complete all fields clearly and accurately. Maximum of 5 pages excluding the budget appendix.
                </p>
                <p className="text-gray-700 mb-4">
                  This form allows Master&apos;s students to submit their concept notes for the Pilot Seed Funding for Research-Driven Innovation.
                </p>
                <button 
                  onClick={() => setShowFullGuidelines(true)}
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  Read full guidelines
                </button>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={() => setAgreementChecked(!agreementChecked)}
                  className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-800">
                  I confirm that I have read and understood the submission guidelines
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Section - Only visible after agreement */}
        {agreementChecked && <SubmissionForm />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DRID UNIBEN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}