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
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  // Add other relevant researcher detail fields here
}

function ResearcherDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [researcher, setResearcher] = useState<ResearcherDetails | null>(null);
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
        setResearcher(response.data); // Assuming response.data is the researcher object
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

  if (!researcher) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-500">Researcher not found.</div>
      </AdminLayout>
    );
  }

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
            {/* Add more researcher details here */}
          </CardContent>
        </Card>

        {/* Add sections for proposals or other related information here */}

      </div>
    </AdminLayout>
  );
}

export default ResearcherDetailsPage;
