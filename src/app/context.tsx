// use this as context for the api integrations for the new route for the score.
export const getFullProposalsForDecision = async (params?: {
  page?: number;
  limit?: number;
  faculty?: string;
  sort?: string;
  order?: "asc" | "desc";
}) => {
  try {
    const response = await api.get(
      "/admin/decisions_2/full-proposals-for-decision",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching full proposals for decision:", error);
    throw error;
  }
};

export const updateFullProposalStatus = async (
  fullProposalId: string,
  data: {
    status: "submitted" | "approved" | "rejected";
    reviewComments: string;
  }
) => {
  try {
    const response = await api.patch(
      `/admin/decisions_2/full-proposal/${fullProposalId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating status for full proposal ${fullProposalId}:`,
      error
    );
    throw error;
  }
};