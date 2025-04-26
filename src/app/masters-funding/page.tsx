"use client";
import Header from "@/components/header";

export default function SubmissionGuidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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
              <strong>Concept Note Submission Template (Master’s Students Only)</strong>
            </p>
            <p className="mb-6 text-gray-700">
              Please complete all fields clearly and accurately. Maximum of 5 pages excluding the budget appendix.
            </p>

            <ol className="list-decimal list-inside space-y-6 text-gray-800">
              <li>
                <strong className="text-purple-800">Project Title:</strong> 
                <span className="block mt-1 text-gray-700">Provide a clear and descriptive title for your project.</span>
              </li>
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
              <li>
                <strong className="text-purple-800">Problem Statement and Justification:</strong>
                <span className="block mt-1 text-gray-700">
                  Briefly describe the problem your project addresses and explain why it is important.
                </span>
              </li>
              <li>
                <strong className="text-purple-800">Objectives and Anticipated Outcomes:</strong>
                <span className="block mt-1 text-gray-700">
                  What are you aiming to achieve? What changes, benefits, or results do you expect from your project?
                </span>
              </li>
              <li>
                <strong className="text-purple-800">Research-Informed Approach and Methodology:</strong>
                <span className="block mt-1 text-gray-700">
                  Explain how you will carry out your research, the methods you will use, and how it is informed by academic knowledge.
                </span>
              </li>
              <li>
                <strong className="text-purple-800">Innovation and Impact:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 text-gray-700">
                  <li>What is novel about your project?</li>
                  <li>How could your project contribute to society, culture, policy, or national development?</li>
                </ul>
              </li>
              <li>
                <strong className="text-purple-800">Interdisciplinary Relevance:</strong>
                <span className="block mt-1 text-gray-700">
                  Show how your project draws from or benefits multiple fields of study, if applicable.
                </span>
              </li>
              <li>
                <strong className="text-purple-800">Implementation Plan and Timeline:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 text-gray-700">
                  <li>Outline the main activities and stages of the project.</li>
                  <li>Provide a realistic timeline covering completion within one academic session.</li>
                </ul>
              </li>
              <li>
                <strong className="text-purple-800">Preliminary Budget Estimate (Separate Appendix):</strong>
                <span className="block mt-1 text-gray-700">
                  Break down how you propose to use the seed funding if awarded, with estimated costs.
                </span>
              </li>
            </ol>

            <h3 className="text-lg font-semibold mt-8 text-purple-800">Important Submission Details:</h3>
            <ul className="list-disc list-inside space-y-2 mt-4 text-gray-700">
              <li>Concept note must not exceed 5 pages (excluding appendix).</li>
              <li>
                Submission Email:{" "}
                <a href="mailto:drid@uniben.edu" className="text-purple-800 underline">
                  drid@uniben.edu
                </a>
              </li>
              <li>Deadline: Monday, 2nd June 2025</li>
              <li>
                For inquiries, contact the DRID Office or email{" "}
                <a href="mailto:drid@uniben.edu" className="text-purple-800 underline">
                  drid@uniben.edu
                </a>.
              </li>
            </ul>
          </div>
        </div>
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