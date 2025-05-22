"use client";

import { useState, useEffect } from "react";
import * as api from "@/services/api";
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown Menu components

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, MoreVertical } from "lucide-react"; // Import MoreVertical for the dot button
import { Button } from "@/components/ui/button"; // Import Button
import { Label } from "@/components/ui/label"; // Import Label
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components
import { Check, AlertCircle } from "lucide-react"; // Import icons for alerts

// Define the interface for researcher data based on the API response
interface Researcher {
  _id: string; // Changed from id to _id
  name: string;
  email: string;
  isActive: boolean; // Assuming the API returns this field
  // Add other relevant researcher fields here
}

function AdminResearchersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>(""); // Add success state
  // Removed state for Dialog

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const response = await api.getResearchersWithProposals(); // Use the correct API
        setResearchers(response.data); // Assuming response.data is the array of researchers
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching researchers:", error);
        setError(error.message || "Failed to load researchers");
        setIsLoading(false);
      }
    };

    fetchResearchers();
  }, []); // Empty dependency array to fetch data only once

  const handleRowClick = (researcherId: string) => { // Re-added handleRowClick
    // Navigate to the researcher details page
    router.push(`/admin/researchers/${researcherId}`);
  };

  const handleSendCredentials = async (researcherId: string) => {
    setError("");
    setSuccess("");
    try {
      await api.sendResearcherCredentials(researcherId);
      setSuccess("Credentials sent successfully.");
      // Update the researcher's status in the local state
      setResearchers(researchers.map(r =>
        r._id === researcherId ? { ...r, isActive: true } : r // Changed r.id to r._id
      ));
    } catch (error: any) {
      console.error("Error sending credentials:", error);
      setError(error.message || "Failed to send credentials.");
    }
  };

  const handleResendCredentials = async (researcherId: string) => { // Modified to accept researcherId
    setError("");
    setSuccess("");
    try {
      await api.resendResearcherCredentials(researcherId); // Use researcherId parameter
      setSuccess("Credentials resent successfully.");
      // No need to close dialog or reset selected researcher state
    } catch (error: any) {
      console.error("Error resending credentials:", error);
      setError(error.message || "Failed to resend credentials.");
    }
  };

  // Removed functions related to Dialog state

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

  return (
    <AdminLayout>
      <div className="space-y-6 p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Researchers
          </h1>
          {/* Add any buttons or actions here if needed */}
        </div>

        {/* Researchers List */}
        <Card>
          <CardHeader>
            <CardTitle>Researchers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <TooltipProvider> {/* Wrap table with TooltipProvider */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Credential Status</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>{researchers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No researchers found.
                        </td>
                      </tr>
                    ) : (
                      researchers.map((researcher) => (
                        <Tooltip key={researcher._id}> {/* Add Tooltip with key */}
                          <TooltipTrigger asChild>
                            <tr
                              key={researcher._id} // Added unique key prop
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleRowClick(researcher._id)} // Re-added onClick handler
                            >
                              {/* Content of the row */}
                              <td className="px-4 py-3 font-medium">
                                {researcher.name}
                              </td>
                              <td className="px-4 py-3">{researcher.email}</td>
                              <td className="px-4 py-3">
                                {researcher.isActive ? "sent" : "pending"}
                              </td>
                              <td className="px-4 py-3">
                                {/* Action buttons - conditional rendering based on isActive */}
                                {!researcher.isActive && (
                                  <Button
                                    variant="default" // Changed variant to default for theme color
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row click
                                      handleSendCredentials(researcher._id); // Changed to _id
                                    }}
                                  >
                                    Send Credentials
                                  </Button>
                                )}
                                {/* Vertical dot button and resend action dropdown trigger */}
                                {researcher.isActive && (
                                  <DropdownMenu> {/* Use DropdownMenu */}
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end"> {/* Use DropdownMenuContent */}
                                      {/* Add alert messages within the dropdown content if needed, or handle them globally */}
                                      {error && (
                                        <Alert variant="destructive" className="mb-2">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                      )}
                                      {success && (
                                        <Alert className="mb-2 bg-green-50 border-green-200">
                                          <Check className="h-4 w-4 text-green-500" />
                                          <AlertDescription className="text-green-700">
                                            {success}
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                      <DropdownMenuItem onClick={() => handleResendCredentials(researcher._id)}> {/* Use DropdownMenuItem and pass researcher._id */}
                                        Resend Credentials
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </td>
                            </tr>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to view details</p>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}</tbody>
                </table>
              </TooltipProvider> {/* Close TooltipProvider */}
            </div>
          </CardContent>
        </Card>
        {/* Keep global success/error alerts outside the table if needed */}
        {success && !researchers.some(r => r.isActive) && ( // Show global success only if no dropdown is open
          <Alert className="mt-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
         {error && !researchers.some(r => r.isActive) && ( // Show global error only if no dropdown is open
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
    );
  }

export default AdminResearchersPage;
