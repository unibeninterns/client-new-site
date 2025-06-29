"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getProposalsForDecision, updateProposalStatus, notifyApplicants, exportDecisionsReport, getFacultiesWithProposals, type ProposalDecision } from '@/services/api';
import { Loader2, MoreVertical, Eye, CheckCircle, XCircle, Bell, TrendingUp, Users, Award, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface DecisionFormData {
  status: 'pending' | 'approved' | 'rejected';
  feedbackComments: string;
  fundingAmount?: number;
  finalScore: number;
}

interface Faculty {
  _id: string;
  title: string;
}

export default function DecisionsPanel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [approvalThreshold, setApprovalThreshold] = useState(0);
  const [proposals, setProposals] = useState<ProposalDecision[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'field'>('score');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Decision form state
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDecision | null>(null);
  const [decisionForm, setDecisionForm] = useState<DecisionFormData>({
    status: 'approved',
    feedbackComments: '',
    fundingAmount: 0,
    finalScore: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState({
    totalProposals: 0,
    pendingDecisions: 0,
    approved: 0,
    rejected: 0,
    averageScore: 0,
    proposalsAboveThreshold: 0
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [proposalsResponse, facultiesResponse] = await Promise.all([
          getProposalsForDecision(),
          getFacultiesWithProposals()
        ]);

        console.log('Proposals loaded:', proposalsResponse.data);
        console.log('Faculties loaded:', facultiesResponse);
        
        setProposals(proposalsResponse.data);
        setFaculties(facultiesResponse);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load proposals for review');
        toast.error('Failed to load proposals for review');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated,]);

  // Update statistics when proposals or threshold changes
  useEffect(() => {
    const totalProposals = proposals.length;
    const pendingDecisions = proposals.filter(p => p.award.status === 'pending').length;
    const approved = proposals.filter(p => p.award.status === 'approved').length;
    const rejected = proposals.filter(p => p.award.status === 'rejected').length;
    const averageScore = totalProposals > 0 
      ? Math.round(proposals.reduce((sum, p) => sum + (p.finalScore || 0), 0) / totalProposals)
      : 0;
    const proposalsAboveThreshold = proposals.filter(p => (p.finalScore || 0) >= approvalThreshold).length;

    setStatistics({
      totalProposals,
      pendingDecisions,
      approved,
      rejected,
      averageScore,
      proposalsAboveThreshold
    });
  }, [proposals, approvalThreshold]);

  const handleDecisionClick = (proposal: ProposalDecision, decision: 'approved' | 'rejected') => {
    setSelectedProposal(proposal);
    setDecisionForm({
      status: decision,
      feedbackComments: '',
      fundingAmount: decision === 'approved' ? proposal.estimatedBudget || 0 : 0,
      finalScore: proposal.finalScore || 0
    });
    setShowDecisionDialog(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedProposal) return;
    
    if (!decisionForm.feedbackComments.trim()) {
      toast.error('Feedback comments are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProposalStatus(selectedProposal._id, decisionForm);
      
      setProposals(prevProposals => 
        prevProposals.map(p => {
          if (p._id === selectedProposal._id) {
            return { ...p, status: decisionForm.status };
          }
          return p;
        })
      );

      toast.success(`Proposal ${decisionForm.status} successfully`);
      setShowDecisionDialog(false);
      setSelectedProposal(null);
    } catch (error) {
      console.error('Failed to update proposal status:', error);
      toast.error('Failed to update proposal status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyApplicant = async (proposalId: string) => {
    try {
      await notifyApplicants(proposalId);
      toast.success('Applicant notified successfully');
      
      // Update the proposal to mark as notified (you might need to add this field)
      setProposals(prevProposals => 
        prevProposals.map(p => {
          if (p._id === proposalId) {
            return { ...p, isNotified: true };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Failed to notify applicant:', error);
      toast.error('Failed to notify applicant');
    }
  };

  const handleViewDetails = (proposalId: string) => {
    router.push(`/admin/decisions/${proposalId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
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

  const filteredProposals = proposals
    .filter(p => filterBy === 'all' || p.award.status === filterBy)
    .filter(p => facultyFilter === 'all' || p.faculty?.title === facultyFilter)
    .filter(p => 
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.submitter?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return (b.finalScore || 0) - (a.finalScore || 0);
      if (sortBy === 'title') return a.projectTitle.localeCompare(b.projectTitle);
      return 0;
    });

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Final Decision Panel</h1>
          <Button
            onClick={exportDecisionsReport}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Export Report
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Total Proposals</p>
                <p className="text-lg font-semibold">{statistics.totalProposals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Pending</p>
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
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Avg Score</p>
                <p className="text-lg font-semibold">{statistics.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-indigo-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Above {approvalThreshold}%</p>
                <p className="text-lg font-semibold">{statistics.proposalsAboveThreshold}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search proposals..."
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
                <SelectContent>
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
              <Select value={sortBy} onValueChange={(value: 'score' | 'title' | 'field') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score (High to Low)</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter</label>
              <Select value={filterBy} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => setFilterBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Proposals</SelectItem>
                  <SelectItem value="pending">Pending Decision</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Approval Threshold: {approvalThreshold}%
              </label>
              <div className="px-2">
                <Slider
                  value={[approvalThreshold]}
                  onValueChange={(value) => setApprovalThreshold(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposal Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Score
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
              {filteredProposals.map((proposal) => (
                <tr 
                  key={proposal._id} 
                  className={`hover:bg-gray-50 ${(proposal.finalScore || 0) >= approvalThreshold ? 'bg-green-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {proposal.projectTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {proposal.submitter?.name} • {proposal.faculty?.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        Budget: ${proposal.estimatedBudget?.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {proposal.aiScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">AI:</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${proposal.aiScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{proposal.aiScore}%</span>
                        </div>
                      )}
                      {proposal.humanScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">Human:</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${proposal.humanScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{proposal.humanScore}%</span>
                        </div>
                      )}
                      {proposal.reconciliationScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">Rec:</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${proposal.reconciliationScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{proposal.reconciliationScore}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-lg font-bold ${getScoreColor(proposal.finalScore || 0)}`}>
                      {proposal.finalScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(proposal.award.status)}`}>
                      {proposal.award.status === 'pending' ? 'Pending Decision' : 
                       proposal.award.status === 'approved' ? 'Approved' : proposal.award.status === 'rejected' ? 'Rejected' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleViewDetails(proposal._id)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        
                        {proposal.award.status === 'pending' && (
                          <>
                            {(proposal.finalScore || 0) >= approvalThreshold ? (
                              <DropdownMenuItem onSelect={() => handleDecisionClick(proposal, 'approved')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => handleDecisionClick(proposal, 'rejected')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        
                        {(proposal.award.status === 'approved' || proposal.award.status === 'rejected') && !proposal.isNotified && (
                          <DropdownMenuItem onSelect={() => handleNotifyApplicant(proposal._id)}>
                            <Bell className="h-4 w-4 mr-2" /> Notify Researcher
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
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {decisionForm.status === 'approved' ? 'Approve Proposal' : 'Reject Proposal'}
              </DialogTitle>
              <DialogDescription>
                {selectedProposal?.projectTitle}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Feedback Comments *
                </label>
                <Textarea
                  value={decisionForm.feedbackComments}
                  onChange={(e) => setDecisionForm(prev => ({ ...prev, feedbackComments: e.target.value }))}
                  placeholder={`Provide feedback for ${decisionForm.status === 'approved' ? 'approval' : 'rejection'}...`}
                  rows={4}
                />
              </div>

              {decisionForm.status === 'approved' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Funding Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={decisionForm.fundingAmount || ''}
                    onChange={(e) => setDecisionForm(prev => ({ 
                      ...prev, 
                      fundingAmount: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="Enter funding amount"
                  />
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600">
                  <strong>Final Score:</strong> {selectedProposal?.finalScore}%
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDecisionDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || !decisionForm.feedbackComments.trim()}
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
      </div>
    </AdminLayout>
  );
}