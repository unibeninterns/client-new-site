"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import * as api from "@/services/api";
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail, Check, AlertCircle, Clock, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Invitation {
  id: string;
  email: string;
  status: "pending" | "accepted" | "expired" | "rejected" | "added";
  created: string;
  expires: string;
}

interface ResearcherFormState {
  name: string;
  email: string;
  faculty: string;
  title: string;
  bio: string;
  profilePicture: File | null;
}

function AdminInvitationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAddResearcherDialog, setShowAddResearcherDialog] = useState<boolean>(false);
  const [researcherForm, setResearcherForm] = useState<ResearcherFormState>({
    name: "",
    email: "",
    faculty: "",
    title: "",
    bio: "",
    profilePicture: null,
  });

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await api.getAllReviewers();
        setInvitations(response.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching invitations:", error);
        setError(error.message || "Failed to load invitations");
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleSendInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.inviteReviewer(email);
      setSuccess(`Invitation sent to ${email}`);

      // Refresh the invitation list
      const response = await api.getAllReviewers();
      setInvitations(response.data);

      setEmail("");
      setTimeout(() => setShowInviteDialog(false), 1500);
    } catch (error: any) {
      setError(error.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendInvitation = async (id: string) => {
    try {
      await api.resendReviewerInvitation(id);

      // Refresh invitations list
      const response = await api.getAllReviewers();
      setInvitations(response.data);

      setSuccess("Invitation resent successfully");
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      setError(error.message || "Failed to resend invitation");
    }
  };

  const deleteInvitation = async (id: string) => {
    if (confirm("Are you sure you want to delete this invitation?")) {
      try {
        await api.deleteReviewer(id);
        setInvitations(
          invitations.filter((invitation) => invitation.id !== id)
        );
        setSuccess("Invitation deleted successfully");
      } catch (error: any) {
        console.error("Error deleting invitation:", error);
        setError(error.message || "Failed to delete invitation");
      }
    }
  };

  const handleAddResearcher = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Construct data object for the API based on the api.addReviewerProfile signature.
      // Note: The form collects 'faculty', 'title', 'bio', and 'profilePicture',
      // but the current api.addReviewerProfile expects 'facultyId', 'departmentId',
      // 'phoneNumber', 'academicTitle', 'alternativeEmail', and does not support
      // 'bio' or 'profilePicture' upload.
      // Placeholder values are used for required fields not present in the form.
      const reviewerData = {
        name: researcherForm.name,
        email: researcherForm.email,
        facultyId: researcherForm.faculty || "placeholder-faculty-id", // Assuming faculty maps to facultyId, using placeholder
        departmentId: "placeholder-department-id", // No department field in form, using placeholder
        phoneNumber: "placeholder-phone-number", // No phone number field in form, using placeholder
        academicTitle: researcherForm.title || undefined, // Assuming title maps to academicTitle
        alternativeEmail: undefined, // No alternative email field in form
      };

      // TODO: The form collects bio and profilePicture, but the current API endpoint
      // does not support these fields. The API or form needs to be updated
      // to fully support adding a researcher profile with all collected data.
      await api.addReviewerProfile(reviewerData);
      setSuccess(`Researcher profile created for ${researcherForm.email}`);

      setResearcherForm({
        name: "",
        email: "",
        faculty: "",
        title: "",
        bio: "",
        profilePicture: null,
      });

      setTimeout(() => setShowAddResearcherDialog(false), 1500);
    } catch (error: any) {
      setError(error.message || "Failed to create researcher profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResearcherForm({
        ...researcherForm,
        profilePicture: e.target.files[0],
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResearcherForm({
      ...researcherForm,
      [name]: value,
    });
  };

  const getStatusBadgeClass = (status: Invitation['status']) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "added":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Invitation['status']) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "accepted":
        return <Check className="h-4 w-4 mr-1" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case "rejected":
        return <X className="h-4 w-4 mr-1" />;
      case "added":
        return <Check className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="space-y-6 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Researcher Invitations
        </h1>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Invite Researcher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Researcher</DialogTitle>
              <DialogDescription>
                Send an invitation email to a new researcher to join the
                platform.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendInvite} className="space-y-4 py-4">
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

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAddResearcherDialog}
          onOpenChange={setShowAddResearcherDialog}
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Researcher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Researcher Profile</DialogTitle>
              <DialogDescription>
                Create a new researcher profile directly. The researcher will
                receive login credentials by email.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddResearcher} className="space-y-4 py-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="researcher-name">Full Name</Label>
                  <Input
                    id="researcher-name"
                    name="name"
                    placeholder="Dr. Jane Smith"
                    value={researcherForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researcher-email">Email Address</Label>
                  <Input
                    id="researcher-email"
                    name="email"
                    type="email"
                    placeholder="researcher@example.com"
                    value={researcherForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researcher-faculty">Faculty/Department</Label>
                  <Input
                    id="researcher-faculty"
                    name="faculty"
                    placeholder="Computer Science"
                    value={researcherForm.faculty}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researcher-title">Title/Position</Label>
                  <Input
                    id="researcher-title"
                    name="title"
                    placeholder="Associate Professor"
                    value={researcherForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researcher-bio">Biography</Label>
                <Textarea
                  id="researcher-bio"
                  name="bio"
                  placeholder="Short biography of the researcher's background and interests..."
                  value={researcherForm.bio}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="researcher-pic">
                  Profile Picture (Optional)
                </Label>
                <Input
                  id="researcher-pic"
                  name="profilePicture"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">
                  Max size: 3MB. Accepted formats: JPEG, PNG, JPG
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddResearcherDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-left font-medium">Expires</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No invitations found.
                    </td>
                  </tr>
                ) : (
                  invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {invitation.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            invitation.status
                          )}`}
                        >
                          {getStatusIcon(invitation.status)}
                          {invitation.status ?
                            invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)
                            : 'N/A'} {/* Added check for undefined status */}
                        </span>
                      </td>
                      <td className="px-4 py-3">{invitation.created}</td>
                      <td className="px-4 py-3">{invitation.expires}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(invitation.status === "expired" ||
                            invitation.status === "rejected") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resendInvitation(invitation.id)}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="ml-1">Resend</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInvitation(invitation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {success && !showInviteDialog && (
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

export default AdminInvitationsPage;
