import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/api';
import { getProposals, getFacultiesWithProposals, toggleProposalArchiveStatus, getEligibleReviewers, reassignRegularReview, reassignReconciliationReview } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader2, FileText, Filter, ArrowUpDown, Eye, RefreshCw, MoreVertical, Archive, FolderOpen, User, Users, Search, CheckCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Fetch faculties with proposals
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!isAuthenticated) return;
      
      try {
        const facultyData = await getFacultiesWithProposals();
        setFaculties(facultyData);
      } catch (err: unknown) {
        if ((err as Error).name === 'CanceledError') {
          // console.log('Faculties fetch aborted (expected)');
        } else {
          console.error('Failed to fetch faculties:', err);
        }
      }
    };

    fetchFaculties();
  }, [isAuthenticated]);

{/* Faculty Filter */}
        <div>
          <label htmlFor="faculty" className="block text-xs font-medium text-gray-500 mb-1">
            Faculty
          </label>
          <select
            id="faculty"
            name="faculty"
            value={filters.faculty}
            onChange={handleFilterChange}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All Faculties</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.title}
              </option>
            ))}
          </select>
        </div>

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
                                  {proposal.submitterType === 'staff' ? 'Staff' : "Master's Student"}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/admin/proposals/${proposal._id}`)}>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              
              {proposal.status === "submitted" && (
                <DropdownMenuItem onSelect={() => handleAssignReviewer(proposal._id)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Assign Reviewer
                </DropdownMenuItem>
              )}
              
              {(() => {
                const { canReassign, isReconciliation } = canReassignReview(proposal);
                return canReassign && (
                  <DropdownMenuItem onSelect={() => handleReassignClick(proposal._id, isReconciliation)}>
                    <RefreshCw className="h-4 w-4 mr-2" /> 
                    {isReconciliation ? 'Reassign Reconciliation' : 'Reassign Review'}
                  </DropdownMenuItem>
                );
              })()}
                                      {proposal.isArchived ? (
                                        <DropdownMenuItem onSelect={() => handleArchiveClick(proposal._id, false)}>
                                          <FolderOpen className="h-4 w-4 mr-2" /> Unarchive
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onSelect={() => handleArchiveClick(proposal._id, true)} className="text-red-500 focus:text-red-500">
                                          <Archive className="h-4 w-4 mr-2" /> Archive
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
        
              {/* Comment Modal */}
              <Dialog open={showCommentModal} onOpenChange={setShowCommentModal} key={showCommentModal ? "open" : "closed"}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{isArchivingAction ? "Archive Proposal" : "Unarchive Proposal"}</DialogTitle>
                    <DialogDescription>
                      {isArchivingAction ? 
                        "Please provide a mandatory comment explaining why you are archiving this proposal." : 
                        "Optionally, provide a comment explaining why you are unarchiving this proposal."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="comment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Comment
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={4}
                        placeholder={isArchivingAction ? "e.g., Proposal archived due to..." : "e.g., Proposal unarchived for further review."}
                      />
                      {commentError && <p className="text-red-500 text-xs mt-1">{commentError}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCommentModal(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmitComment}>
                      {isArchivingAction ? "Archive" : "Unarchive"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              // to view datails
const handleViewDetails = (proposalId: string) => {
    router.push(`/admin/decisions/${proposalId}`);
  };
  // this is it in use
  onClick={() => handleViewDetails(proposal._id)}
  