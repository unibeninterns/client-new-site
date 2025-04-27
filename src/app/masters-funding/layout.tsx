export const metadata = {
    title: "Master's Proposal Submission - DRID, University of Benin",
    description: "Submit your concept note for the Pilot Seed Funding for Research-Driven Innovation by the Directorate of Research, Innovation and Development (DRID), University of Benin. Open to Master's students only."
}

export default function MastersFundingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}