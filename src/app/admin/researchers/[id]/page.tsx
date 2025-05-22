"use client";

import { useState, useEffect } from "react";
import * as api from "@/services/api";
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

// Define the interface for researcher details based on the API response
interface ResearcherDetails {
  _id: string;
  academicTitle?: string;
  alternativeEmail?: string;
  assignedProposals: string[]; // Assuming array of proposal IDs
  completedReviews: string[]; // Assuming array of review IDs
  createdAt: string;
  credentialsSent: boolean;
  credentialsSentAt?: string;
  department: string; // Assuming department ID
  email: string;
  faculty: string; // Assuming faculty ID
  invitationStatus: string;
  isActive: boolean;
  name: string;
  phoneNumber: string;
  proposals: string[]; // Assuming array of proposal IDs
  role: string;
  userType: string;
  __v: number;
}

// Define the interface for proposal details
interface ProposalDetails {
  _id: string;
  projectTitle?: string; // Added projectTitle to the interface
  reviewStatus: string;
  submitterType: string;
  submitter: string; // Assuming researcher ID
  status: string;
  createdAt: string;
  updatedAt: string;
  docFile?: string; // Assuming optional doc file URL
  coInvestigators: string[]; // Assuming array of co-investigator IDs
  __v: number;
}

function ResearcherDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [researcherData, setResearcherData] = useState<{ researcher: ResearcherDetails, proposals: ProposalDetails[] } | null>(null); // State to hold both researcher and proposals
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const params = useParams();
  const researcherId = params.id as string; // Get the researcher ID from the URL

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!researcherId) {
      setError("Researcher ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchResearcherDetails = async () => {
      try {
        const response = await api.getResearcherDetails(researcherId); // Use the correct API
        console.log(response.data)
        setResearcherData(response.data); // Set the entire response data
        setIsLoading(false);
      } catch (error: any) {
        console.error(`Error fetching researcher details for ID ${researcherId}:`, error);
        setError(error.message || "Failed to load researcher details");
        setIsLoading(false);
      }
    };

    fetchResearcherDetails();
  }, [researcherId]); // Fetch data when researcherId changes

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  if (!researcherData) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-500">Researcher not found.</div>
      </AdminLayout>
    );
  }

  const { researcher, proposals } = researcherData; // Destructure researcher and proposals

  return (
    <AdminLayout>
      <div className="space-y-6 p-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Researcher Details: {researcher.name}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Removed ID display */}
            <div>
              <p className="text-sm font-medium">Name:</p>
              <p>{researcher.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email:</p>
              <p>{researcher.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status:</p>
              <p>{researcher.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Academic Title:</p>
              <p>{researcher.academicTitle || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium">Phone Number:</p>
              <p>{researcher.phoneNumber || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium">User Type:</p>
              <p>{researcher.userType || 'N/A'}</p>
            </div>
            {/* Add more researcher details here based on the interface */}
          </CardContent>
        </Card>

        {/* Proposals Section */}
        <Card>
          <CardHeader>
            <CardTitle>Associated Proposals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {/* Removed Proposal Title header */}
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Review Status</th>
                    <th className="px-4 py-3 text-left font-medium">Submitter Type</th>
                    {/* Add more proposal headers here */}
                  </tr>
                </thead>
                <tbody>
                  {proposals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3} // Adjusted colspan back to 3
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No associated proposals found.
                      </td>
                    </tr>
                  ) : (
                    proposals.map((proposal) => (
                      <tr
                        key={proposal._id} // Use proposal _id as key
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        // Add onClick for proposal details if needed
                      >
                        {/* Removed Proposal Title data cell */}
                        <td className="px-4 py-3">{proposal.status}</td>
                        <td className="px-4 py-3">{proposal.reviewStatus}</td>
                        <td className="px-4 py-3">{proposal.submitterType}</td>
                        {/* Add more proposal data cells here */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

export default ResearcherDetailsPage;
