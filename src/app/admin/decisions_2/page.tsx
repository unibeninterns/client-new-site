"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getFullProposalsForDecision, assignFullProposalScore, editFullProposalScore, updateFullProposalStatus, notifyFullProposalApplicants, getFacultiesWithProposals, type FullProposalDecision } from '@/services/api';
import { Loader2, MoreVertical, Eye, CheckCircle, XCircle, Bell, TrendingUp, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Suspense } from "react";

interface FullProposalDecisionFormData {
  status: 'submitted' | 'approved' | 'rejected';
  reviewComments: string;
}

interface Faculty {
  _id: string;
  title: string;
}

export default function FullProposalDecisionsPanelWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
      </div>
    }>
      <FullProposalDecisionsPanel />
    </Suspense>
  );
}

function FullProposalDecisionsPanel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [fullProposals, setFullProposals] = useState<FullProposalDecision[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [sortBy, setSortBy] = useState<'submittedAt' | 'title' | 'deadline' | 'score'>('score');
  const [filterBy, setFilterBy] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [scoreValue, setScoreValue] = useState<number>(1);
  const [showEditScoreDialog, setShowEditScoreDialog] = useState(false);
const [editScoreValue, setEditScoreValue] = useState<number>(1);


  const limit = 10;
  
  // Decision form state
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [selectedFullProposal, setSelectedFullProposal] = useState<FullProposalDecision | null>(null);
  const [decisionForm, setDecisionForm] = useState<FullProposalDecisionFormData>({
    status: 'approved',
    reviewComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Statistics
  const [statistics, setStatistics] = useState({
    totalFullProposals: 0,
    pendingDecisions: 0,
    approved: 0,
    rejected: 0,
    submittedThisMonth: 0,
    nearingDeadline: 0,
    approvedBudget: 0,
  });

  // Data loading function
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fullProposalsResponse, facultiesResponse] = await Promise.all([
        getFullProposalsForDecision({ 
          page: currentPage, 
          limit,
          faculty: facultyFilter !== 'all' ? facultyFilter : undefined,
          sort: sortBy,
          order: 'desc'
        }),
        getFacultiesWithProposals()
      ]);

      console.log('Full Proposals loaded:', fullProposalsResponse);
      console.log('Statistics received:', fullProposalsResponse.statistics);
      
      setFullProposals(fullProposalsResponse.data);
      setFaculties(facultiesResponse);
      setTotalPages(fullProposalsResponse.totalPages || 1);
      setTotalCount(fullProposalsResponse.total || 0);
      
      // Update statistics from backend response
      if (fullProposalsResponse.statistics) {
        setStatistics(fullProposalsResponse.statistics);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load full proposals for review');
      toast.error('Failed to load full proposals for review');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, facultyFilter, limit, sortBy]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Initial data load effect
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleDecisionClick = (fullProposal: FullProposalDecision, decision: 'approved' | 'rejected') => {
    setSelectedFullProposal(fullProposal);
    setDecisionForm({
      status: decision,
      reviewComments: ''
    });
    setShowDecisionDialog(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedFullProposal) return;
    
    if (!decisionForm.reviewComments.trim()) {
      toast.error('Review comments are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateFullProposalStatus(selectedFullProposal._id, decisionForm);
      
      setFullProposals(prevFullProposals => 
        prevFullProposals.map(fp => {
          if (fp._id === selectedFullProposal._id) {
            return { 
              ...fp, 
              status: decisionForm.status,
              reviewComments: decisionForm.reviewComments,
              reviewedAt: new Date().toISOString()
            };
          }
          return fp;
        })
      );

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        pendingDecisions: prev.pendingDecisions - (selectedFullProposal.status === 'submitted' ? 1 : 0),
        approved: prev.approved + (decisionForm.status === 'approved' ? 1 : 0),
        rejected: prev.rejected + (decisionForm.status === 'rejected' ? 1 : 0),
        approvedBudget: prev.approvedBudget + (decisionForm.status === 'approved' ? selectedFullProposal.award?.fundingAmount || 0 : 0)
      }));

      toast.success(`Full proposal ${decisionForm.status} successfully`);
      setShowDecisionDialog(false);
      setSelectedFullProposal(null);
      setDecisionForm({
        status: 'approved',
        reviewComments: ''
      });
    } catch (error) {
      console.error('Failed to update full proposal status:', error);
      toast.error('Failed to update full proposal status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (value: 'submittedAt' | 'title' | 'deadline' | 'score') => {
    setSortBy(value);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowDecisionDialog(false);
      setSelectedFullProposal(null);
      setDecisionForm({
        status: 'approved',
        reviewComments: ''
      });
    }
  };

  const handleAssignScore = async () => {
  if (!selectedFullProposal) return;
  
  try {
    setIsSubmitting(true);
    await assignFullProposalScore(selectedFullProposal._id, scoreValue);
    
    setFullProposals(prevFullProposals => 
      prevFullProposals.map(fp => {
        if (fp._id === selectedFullProposal._id) {
          return { ...fp, score: scoreValue };
        }
        return fp;
      })
    );

    toast.success('Score assigned successfully');
    setShowScoreDialog(false);
    setSelectedFullProposal(null);
    setScoreValue(1);
  } catch (error) {
    console.error('Failed to assign score:', error);
    toast.error('Failed to assign score');
  } finally {
    setIsSubmitting(false);
  }
};

const handleEditScore = async () => {
  if (!selectedFullProposal) return;

  try {
    setIsSubmitting(true);
    await editFullProposalScore(selectedFullProposal._id, editScoreValue);

    setFullProposals(prevFullProposals =>
      prevFullProposals.map(fp =>
        fp._id === selectedFullProposal._id
          ? { ...fp, score: editScoreValue }
          : fp
      )
    );

    toast.success('Score updated successfully');
    setShowEditScoreDialog(false);
    setSelectedFullProposal(null);
    setEditScoreValue(1);
  } catch (error) {
    console.error('Failed to update score:', error);
    toast.error('Failed to update score');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleNotifyApplicant = async (fullProposalId: string) => {
    try {
      await notifyFullProposalApplicants(fullProposalId);
      toast.success('Applicant notified successfully');
      
      // Update the full proposal to mark as notified
      setFullProposals(prevFullProposals => 
        prevFullProposals.map(fp => {
          if (fp._id === fullProposalId) {
            return { 
              ...fp, 
              lastNotifiedAt: new Date().toISOString(),
              notificationCount: (fp.notificationCount || 0) + 1
            };
          }
          return fp;
        })
      );
    } catch (error) {
      console.error('Failed to notify applicant:', error);
      toast.error('Failed to notify applicant');
    }
  };

  const handleViewDetails = (fullProposalId: string) => {
    router.push(`/admin/decisions_2/${fullProposalId}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'submitted':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredFullProposals = fullProposals
    .filter(fp => filterBy === 'all' || fp.status === filterBy)
    .filter(fp => facultyFilter === 'all' || fp.faculty?._id === facultyFilter)
    .filter(fp => 
      fp.originalProposal?.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fp.submitter?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Full Proposal Decision Panel</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Total Full Proposals</p>
                <p className="text-lg font-semibold">{statistics.totalFullProposals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Pending Review</p>
                <p className="text-lg font-semibold">{statistics.pendingDecisions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Approved</p>
                <p className="text-lg font-semibold">{statistics.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-lg font-semibold">{statistics.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Approved Budget</p>
                <p className="text-lg font-semibold">
                  ₦{statistics.approvedBudget?.toLocaleString() ?? '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search full proposals..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Faculty</label>
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="submittedAt">Submission Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter</label>
              <Select value={filterBy} onValueChange={(value: 'all' | 'submitted' | 'approved' | 'rejected') => setFilterBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Proposals</SelectItem>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Full Proposals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Proposal Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Score
</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFullProposals.map((fullProposal) => (
                <tr 
                  key={fullProposal._id} 
                  className={`hover:bg-gray-50 ${
                    fullProposal.status === 'submitted' 
                      ? 'bg-orange-50' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {fullProposal.originalProposal?.projectTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fullProposal.submitter?.name} • {fullProposal.faculty?.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        Funding Amount: ₦{fullProposal.award?.fundingAmount?.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
  {typeof fullProposal.score === 'number' ? (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full">
        <div
          className={`
            h-full rounded-full
            ${fullProposal.score >= 80
              ? 'bg-green-600'
              : fullProposal.score >= 60
              ? 'bg-yellow-500'
              : 'bg-red-500'
            }
          `}
          style={{ width: `${fullProposal.score}%` }}
        />
      </div>
      <span className={`
        text-xs font-bold
        ${fullProposal.score >= 80
          ? 'text-green-700'
          : fullProposal.score >= 60
          ? 'text-yellow-700'
          : 'text-red-700'
        }
      `}>
        {fullProposal.score}%
      </span>
    </div>
  ) : (
    <span className="text-gray-400">--</span>
  )}
</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(fullProposal.status)}`}>
                      {fullProposal.status === 'submitted' ? 'Pending Review' : 
                       fullProposal.status === 'approved' ? 'Approved' : 
                       fullProposal.status === 'rejected' ? 'Rejected' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu
                      open={openMenuId === fullProposal._id}
                      onOpenChange={(open) => setOpenMenuId(open ? fullProposal._id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setOpenMenuId(fullProposal._id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
  <DropdownMenuItem onSelect={() => handleViewDetails(fullProposal._id)}>
    <Eye className="h-4 w-4 mr-2" /> View Details
  </DropdownMenuItem>
  {!fullProposal.score && (
    <DropdownMenuItem
      onSelect={e => {
        e.preventDefault();
        setSelectedFullProposal(fullProposal);
        setScoreValue(1);
        setShowScoreDialog(true);
        setOpenMenuId(null);
      }}
    >
      <TrendingUp className="h-4 w-4 mr-2 text-blue-600" /> Assign Score
    </DropdownMenuItem>
  )}
  {fullProposal.score && fullProposal.status === 'submitted' && (
    <>

      <DropdownMenuItem
        onSelect={e => {
          e.preventDefault();
          setSelectedFullProposal(fullProposal);
          setEditScoreValue(Number(fullProposal.score) || 1);
          setShowEditScoreDialog(true);
          setOpenMenuId(null);
        }}
      >
        <TrendingUp className="h-4 w-4 mr-2 text-blue-600" /> Edit Score
      </DropdownMenuItem>

      <DropdownMenuItem
        onSelect={e => {
          e.preventDefault();
          setOpenMenuId(null);
          setTimeout(() => handleDecisionClick(fullProposal, 'approved'), 0);
        }}
      >
        <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={e => {
          e.preventDefault();
          setOpenMenuId(null);
          setTimeout(() => handleDecisionClick(fullProposal, 'rejected'), 0);
        }}
      >
        <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject
      </DropdownMenuItem>
    </>
  )}
  {(fullProposal.status === 'approved' || fullProposal.status === 'rejected') && (
    <DropdownMenuItem onSelect={() => handleNotifyApplicant(fullProposal._id)}>
      <Bell className="h-4 w-4 mr-2" /> 
      {(fullProposal.notificationCount ?? 0) > 0 
        ? `Notify Again (${fullProposal.notificationCount ?? 0} sent)` 
        : 'Notify Researcher'
      }
    </DropdownMenuItem>
  )}
</DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {decisionForm.status === 'approved' ? 'Approve Full Proposal' : 'Reject Full Proposal'}
              </DialogTitle>
              <DialogDescription>
                {selectedFullProposal?.originalProposal?.projectTitle}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Review Comments *
                </label>
                <Textarea
                  value={decisionForm.reviewComments}
                  onChange={(e) => setDecisionForm(prev => ({ ...prev, reviewComments: e.target.value }))}
                  placeholder={`Provide detailed review comments for ${decisionForm.status === 'approved' ? 'approval' : 'rejection'}...`}
                  rows={4}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600">
                  <strong>Submitted:</strong> {selectedFullProposal && formatDate(selectedFullProposal.submittedAt)}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Deadline:</strong> {selectedFullProposal && formatDate(selectedFullProposal.deadline)}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Funding Amount:</strong> ₦{selectedFullProposal?.award?.fundingAmount?.toLocaleString()}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleDialogClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || !decisionForm.reviewComments.trim()}
                className={decisionForm.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {decisionForm.status === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Assign Score</DialogTitle>
      <DialogDescription>
        {selectedFullProposal?.originalProposal?.projectTitle}
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Score (1-100) *
        </label>
        <input
          type="number"
          min="1"
          max="100"
          step="0.01"
          value={scoreValue}
          onChange={(e) => setScoreValue(parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
    </div>

    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setShowScoreDialog(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleAssignScore}
        disabled={isSubmitting || scoreValue < 1 || scoreValue > 100}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Assign Score
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Dialog open={showEditScoreDialog} onOpenChange={setShowEditScoreDialog}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Edit Score</DialogTitle>
      <DialogDescription>
        {selectedFullProposal?.originalProposal?.projectTitle}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Score (0-100) *
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={editScoreValue}
          onChange={(e) => setEditScoreValue(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      </div>
    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setShowEditScoreDialog(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleEditScore}
        disabled={isSubmitting || editScoreValue < 0 || editScoreValue > 100}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Update Score
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}