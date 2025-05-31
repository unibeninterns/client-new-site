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
import { getProposalsForDecision, updateProposalStatus, notifyApplicants, exportDecisionsReport, type ProposalDecision } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DecisionsPanel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [approvalThreshold, setApprovalThreshold] = useState(75);
  const [proposals, setProposals] = useState<ProposalDecision[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'field'>('score');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState(''); // Added searchQuery state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        const response = await getProposalsForDecision();
        setProposals(response.data);
        console.log('Proposals loaded:', response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('Failed to load proposals for review');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, []);

  const handleDecision = async (proposalId: string, decision: 'approved' | 'rejected') => {
    try {
      await updateProposalStatus(proposalId, { status: decision });
      setProposals(prevProposals => 
        prevProposals.map(p => {
          if (p.id === proposalId) {
            return { ...p, status: decision };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Failed to update proposal status:', error);
    }
  };

  const handleNotifyApplicants = async () => {
    try {
      const decidedProposals = proposals.filter(p => p.status !== 'pending').map(p => p.id);
      for (const proposalId of decidedProposals) {
        await notifyApplicants(proposalId);
      }
      // Show success message
      alert('Applicants notified successfully!'); // Using a simple alert for now
    } catch (error) {
      console.error('Failed to notify applicants:', error);
      alert('Failed to notify applicants.'); // Show error message
    }
  };

  const handleExportReport = async () => {
    try {
      const result = await exportDecisionsReport();
      if (result.success) {
        alert(result.message);
      } else {
        alert('Failed to export report.');
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report.');
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
    .filter(p => filterBy === 'all' || p.status === filterBy)
    .filter(p => 
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fieldOfResearch.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.totalScore - a.totalScore;
      if (sortBy === 'title') return a.projectTitle.localeCompare(b.projectTitle);
      if (sortBy === 'field') return a.fieldOfResearch.localeCompare(b.fieldOfResearch);
      return 0;
    });

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Final Aggregation & Decision Panel</h1>
        
        {/* Controls */}
        <div className="flex gap-4 mb-6 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
            <Select 
            value={sortBy} 
            onValueChange={(value: 'score' | 'title' | 'field') => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score (High to Low)</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="field">Field of Research</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filterBy} 
            onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => setFilterBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Proposals</SelectItem>
              <SelectItem value="pending">Pending Decision</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Approval threshold</span>
            <div className="w-32">
              <Slider
                value={[approvalThreshold]}
                onValueChange={(value) => setApprovalThreshold(value[0])}
                max={100}
                step={1}
              />
            </div>
            <span className="text-sm font-medium">{approvalThreshold}%</span>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposal Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field of Research
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score Breakdown
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Decision
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr 
                  key={proposal.id} 
                  className={`${proposal.totalScore >= approvalThreshold ? 'bg-green-50' : ''}`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {proposal.projectTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {proposal.fieldOfResearch}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {proposal.totalScore}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">AI {proposal.scores?.ai ?? 0}%</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${proposal.scores?.ai ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">R1 {proposal.scores?.reviewer1 ?? 0}%</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${proposal.scores?.reviewer1 ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">R2 {proposal.scores?.reviewer2 ?? 0}%</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-purple-300 rounded-full"
                            style={{ width: `${proposal.scores?.reviewer2 ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {proposal.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          key={`${proposal.id}-approve`}
                          onClick={() => handleDecision(proposal.id, 'approved')}
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          Approve
                        </Button>
                        <Button
                          key={`${proposal.id}-reject`}
                          onClick={() => handleDecision(proposal.id, 'rejected')}
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span key={`${proposal.id}-status`} className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        proposal.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {proposal.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            onClick={handleNotifyApplicants}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Notify Applicants
          </Button>
          <Button
            onClick={handleExportReport}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Export Report
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
