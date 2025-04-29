"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProposals } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, FileText, Filter, ArrowUpDown, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Proposal {
  _id: string;
  projectTitle: string;
  submitterType: 'staff' | 'master_student';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  createdAt: string;
  submitter: {
    name: string;
    email: string;
  };
}

interface PaginationData {
  count: number;
  totalPages: number;
  currentPage: number;
}

export default function AdminProposalsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    count: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    submitterType: '',
    sort: 'createdAt',
    order: 'desc'
  });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getProposals({
          page: pagination.currentPage,
          limit: 10,
          ...filters
        });
        
        setProposals(response.data);
        setPagination({
          count: response.count,
          totalPages: response.totalPages,
          currentPage: response.currentPage
        });
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
        setError('Failed to load proposals. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [isAuthenticated, pagination.currentPage, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const toggleSortOrder = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const refreshData = () => {
    setPagination(prev => ({ ...prev })); // Trigger useEffect to reload data
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      revision_requested: 'Needs Revision'
    };
    
    return statusMap[status] || status;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">All Proposals</h1>
            <button 
              onClick={refreshData}
              className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center">
                <Filter className="text-gray-400 mr-2 h-5 w-5" />
                <span className="text-sm font-medium text-gray-500">Filters:</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="revision_requested">Needs Revision</option>
                  </select>
                </div>
                
                {/* Submitter Type Filter */}
                <div>
                  <label htmlFor="submitterType" className="block text-xs font-medium text-gray-500 mb-1">
                    Submitter Type
                  </label>
                  <select
                    id="submitterType"
                    name="submitterType"
                    value={filters.submitterType}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">All Types</option>
                    <option value="staff">Staff</option>
                    <option value="master_student">Master&apos;s Student</option>
                  </select>
                </div>
                
                {/* Sort Order */}
                <div>
                  <label htmlFor="sort" className="block text-xs font-medium text-gray-500 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="createdAt">Submission Date</option>
                    <option value="projectTitle">Project Title</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Proposals Table */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-800" />
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No proposals match your current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSortOrder('projectTitle')}
                      >
                        <div className="flex items-center">
                          Project Title
                          {filters.sort === 'projectTitle' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      >
                        Submitter
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSortOrder('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {filters.sort === 'status' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSortOrder('createdAt')}
                      >
                        <div className="flex items-center">
                          Submitted
                          {filters.sort === 'createdAt' && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposals.map((proposal) => (
                      <tr key={proposal._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {proposal.projectTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">{proposal.submitter.name}</span>
                            <span className="text-xs text-gray-400">{proposal.submitter.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposal.submitterType === 'staff' ? 'Staff' : 'Master\'s Student'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(proposal.status)}`}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(proposal.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/proposals/${proposal._id}`}
                            className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && proposals.length > 0 && (
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * 10, pagination.count)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.count}</span> proposals
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}