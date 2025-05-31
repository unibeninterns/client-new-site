"use client"
import Link from 'next/link';
import Header from '@/components/header';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-900 text-white">
      {/* Header */}
      <Header />

      {/* Hero Section - Updated */}
      <main className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-xl p-10 shadow-2xl border border-white/20">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Proposal Submission Closed
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            The deadline for proposal submissions has been met. We appreciate your interest and participation.
          </p>
          <p className="text-lg text-gray-300">
            Please check back later for future funding opportunities or contact us for more information.
          </p>
          <div className="mt-10">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-purple-800 bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Contact Us
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-300">
            © {new Date().getFullYear()} DRID UNIBEN. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            For technical support, please contact:{' '}
            <Link href="mailto:drid@uniben.edu" className="text-blue-300 hover:text-blue-100 transition-colors" title="send email">
              drid@uniben.edu
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
