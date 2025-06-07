import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { User, Users, Loader2, RefreshCcw, CheckCircle, X, Search } from 'lucide-react';
import { getEligibleReviewers, reassignRegularReview, reassignReconciliationReview } from '@/services/api';

interface ReassignReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  isReconciliation?: boolean;
  onReassignSuccess: () => void;
}

const ReassignReviewModal: React.FC<ReassignReviewModalProps> = ({
  isOpen,
  onClose,
  proposalId,
  isReconciliation = false,
  onReassignSuccess
}) => {
  const [mode, setMode] = useState<'auto' | 'manual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eligibleReviewers, setEligibleReviewers] = useState<any[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalInfo, setProposalInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (mode === 'manual') {
      loadEligibleReviewers();
    }
  }, [mode]);

  const loadEligibleReviewers = async () => {
    try {
      setIsLoading(true);
      const response = await getEligibleReviewers(proposalId);
      setEligibleReviewers(response.data.eligibleReviewers);
      setProposalInfo(response.data.proposalInfo);
    } catch (err) {
      setError('Failed to load eligible reviewers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassign = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const reassignFn = isReconciliation ? reassignReconciliationReview : reassignRegularReview;
      const response = await reassignFn(proposalId, mode === 'manual' ? selectedReviewer : undefined);

      setSuccess(true);
      setTimeout(() => {
        onReassignSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to reassign review');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviewers = eligibleReviewers.filter(reviewer =>
    reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reviewer.facultyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => !isLoading && onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isReconciliation ? 'Reassign Reconciliation Review' : 'Reassign Review'}
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">Review reassigned successfully!</p>
              </div>
            ) : (
              <>
                {!mode ? (
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Choose how you want to reassign this {isReconciliation ? 'reconciliation ' : ''}review:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setMode('auto')}
                        className="p-6 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                      >
                        <RefreshCcw className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Automatic Reassignment</h3>
                        <p className="text-sm text-gray-500">
                          System will automatically select the best available reviewer based on workload and expertise.
                        </p>
                      </button>
                      <button
                        onClick={() => setMode('manual')}
                        className="p-6 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                      >
                        <Users className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Manual Selection</h3>
                        <p className="text-sm text-gray-500">
                          Choose from a list of eligible reviewers to manually assign the review.
                        </p>
                      </button>
                    </div>
                  </div>
                ) : mode === 'manual' ? (
                  <div className="space-y-4">
                    {proposalInfo && (
                      <div className="bg-purple-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-purple-900 mb-2">Proposal Information</h4>
                        <p className="text-sm text-purple-800">Title: {proposalInfo.title}</p>
                        <p className="text-sm text-purple-800">Faculty: {proposalInfo.submitterFaculty}</p>
                      </div>
                    )}

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search reviewers..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                      ) : filteredReviewers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No eligible reviewers found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredReviewers.map((reviewer) => (
                            <div
                              key={reviewer._id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                selectedReviewer === reviewer._id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                              }`}
                              onClick={() => setSelectedReviewer(reviewer._id)}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-purple-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{reviewer.name}</p>
                                  <p className="text-sm text-gray-500">{reviewer.facultyTitle}</p>
                                </div>
                                <div className="text-right text-sm">
                                  <p className="text-gray-900">
                                    {reviewer.totalReviewsCount} Reviews
                                  </p>
                                  <p className={getCompletionRateColor(reviewer.completionRate)}>
                                    {reviewer.completionRate}% Completion
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">
                      Proceed with automatic reassignment to the most suitable reviewer?
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {mode && (
                    <button
                      onClick={handleReassign}
                      disabled={isLoading || (mode === 'manual' && !selectedReviewer)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Reassign Review
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ReassignReviewModal;


// Add this to your proposal list/detail component
import ReassignReviewModal from '@/components/admin/proposals/ReassignReviewModal';

// Inside your component:
const [showReassignModal, setShowReassignModal] = useState(false);
const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

const handleReassignClick = (proposalId: string) => {
  setSelectedProposalId(proposalId);
  setShowReassignModal(true);
};

// Add this button in your proposal actions:
<button
  onClick={() => handleReassignClick(proposal._id)}
  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
>
  <RefreshCcw className="h-4 w-4 mr-1.5" />
  Reassign Review
</button>

// Add the modal component:
{showReassignModal && selectedProposalId && (
  <ReassignReviewModal
    isOpen={showReassignModal}
    onClose={() => {
      setShowReassignModal(false);
      setSelectedProposalId(null);
    }}
    proposalId={selectedProposalId}
    isReconciliation={proposal.status === 'revision_requested'}
    onReassignSuccess={() => {
      // Refresh your proposals list or detail view
      refreshProposals();
    }}
  />
)}

export const canReassignReview = (proposal: any): { 
  canReassign: boolean; 
  isReconciliation: boolean 
} => {
  // For regular review reassignment
  if (proposal.status === 'under_review') {
    const hasIncompleteReview = proposal.reviews?.some(
      (review: any) => review.status !== 'completed' && review.reviewType === 'human'
    );
    return { canReassign: hasIncompleteReview, isReconciliation: false };
  }
  
  // For reconciliation review reassignment
  if (proposal.status === 'revision_requested' && proposal.reviewStatus === 'pending') {
    const hasIncompleteReconciliation = !proposal.reviews?.some(
      (review: any) => review.status === 'completed' && review.reviewType === 'reconciliation'
    );
    return { canReassign: hasIncompleteReconciliation, isReconciliation: true };
  }

  return { canReassign: false, isReconciliation: false };
};