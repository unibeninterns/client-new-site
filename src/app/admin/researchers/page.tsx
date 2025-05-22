"use client";

import { useState, useEffect } from "react";
import * as api from "@/services/api";
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // Import Link

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, MoreVertical } from "lucide-react"; // Import MoreVertical for the dot button
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [showResendDialog, setShowResendDialog] = useState<boolean>(false); // State for resend dialog
  const [selectedResearcherId, setSelectedResearcherId] = useState<string | null>(null); // State to hold the ID of the researcher for the dialog

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

  // Removed handleRowClick as navigation will be handled by Link

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

  const handleResendCredentials = async () => {
    if (!selectedResearcherId) return;

    setError("");
    setSuccess("");
    try {
      await api.resendResearcherCredentials(selectedResearcherId);
      setSuccess("Credentials resent successfully.");
      setShowResendDialog(false); // Close dialog on success
      setSelectedResearcherId(null); // Reset selected researcher
    } catch (error: any) {
      console.error("Error resending credentials:", error);
      setError(error.message || "Failed to resend credentials.");
    }
  };

  const openResendDialog = (researcherId: string) => {
    setSelectedResearcherId(researcherId);
    setShowResendDialog(true);
  };

  const closeResendDialog = () => {
    setShowResendDialog(false);
    setSelectedResearcherId(null);
    setError(""); // Clear errors when closing dialog
    setSuccess(""); // Clear success when closing dialog
  };

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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Credential Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {researchers.length === 0 ? (
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
                      <tr
                        key={researcher._id} // Changed key to _id
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        // Removed onClick handler
                      >
                        {/* Wrap row content in Link */}
                        <Link href={`/admin/researchers/${researcher._id}`} className="contents"> {/* Changed href to use _id */}
                          <td className="px-4 py-3 font-medium">
                            {researcher.name}
                          </td>
                          <td className="px-4 py-3">{researcher.email}</td>
                          <td className="px-4 py-3">
                            {researcher.isActive ? "sent" : "pending"}
                          </td>
                        </Link>
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
                          {/* Vertical dot button and resend action dialog trigger */}
                          {researcher.isActive && (
                            <Dialog
                              key={researcher._id} // Changed key to _id
                              open={showResendDialog && selectedResearcherId === researcher._id} // Changed to _id
                              onOpenChange={(open) => {
                                if (open) {
                                  openResendDialog(researcher._id); // Changed to _id
                                } else {
                                  closeResendDialog();
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Researcher Actions</DialogTitle>
                                  <DialogDescription>
                                    Select an action for {researcher.name}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  {error && (
                                    <Alert variant="destructive" className="mb-4">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                  )}
                                  {success && (
                                    <Alert className="mb-4 bg-green-50 border-green-200">
                                      <Check className="h-4 w-4 text-green-500" />
                                      <AlertDescription className="text-green-700">
                                        {success}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={handleResendCredentials}
                                  >
                                    Resend Credentials
                                  </Button>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={closeResendDialog}>
                                    Cancel
                                  </Button>
                                </DialogFooter> {/* Added closing tag */}
                              </DialogContent>
                            </Dialog>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {success && !showResendDialog && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminResearchersPage;
