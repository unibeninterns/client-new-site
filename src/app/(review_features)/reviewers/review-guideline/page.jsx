'use client'

import ReviewerLayout from '@/components/reviewers/ReviewerLayout';

export default function ReviewGuideline() {
    return (
        <>
        <ReviewerLayout>
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
                <h1 className="text-2xl font-bold text-center mb-6">TETFund IBR Proposal Grading Template</h1>
                
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="space-y-2">
                        <p><span className="font-semibold">Department/Faculty:</span> Computer Science</p>
                        <p><span className="font-semibold">Proposal Title:</span> Research on AI Applications</p>
                        <p><span className="font-semibold">Reviewer Name:</span> Dr. John Smith</p>
                        <p><span className="font-semibold">Date of Review:</span> 01/01/2024</p>
                    </div>
                </div>

                {/* Scoring Table */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Scoring Rubric (Total: 100 points)</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Evaluation Criteria</th>
                                    <th className="border p-2">Description</th>
                                    <th className="border p-2">Max Score</th>
                                    <th className="border p-2">Score Given</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Relevance to National/Institutional Priorities', "Alignment with Nigeria's national development goals or UNIBEN research priorities", 10, '8'],
                                    ['Originality and Innovation', 'Novelty of research idea; advancement of knowledge; creativity', 15, '12'],
                                    ['Clarity of Research Problem and Objectives', 'Clearly defined problem statement and SMART objectives', 10, '9'],
                                    ['Methodology', 'Appropriateness, rigor, and feasibility of the research design, tools, and approach', 15, '13'],
                                    ['Literature Review and Theoretical Framework', 'Sound grounding in existing literature; clear conceptual framework', 10, '8'],
                                    ['Team Composition and Expertise', 'Appropriateness of team, interdisciplinary balance, qualifications', 10, '9'],
                                    ['Feasibility and Timeline', 'Realistic scope, milestones, and timeline within funding duration', 10, '8'],
                                    ['Budget Justification and Cost-Effectiveness', 'Clear and justified budget aligned with project goals', 10, '9'],
                                    ['Expected Outcomes and Impact', 'Potential contributions to policy, community, academia, industry', 5, '4'],
                                    ['Sustainability and Scalability', 'Potential for continuation, replication, or scale-up beyond funding', 5, '4'],
                                ].map((row, index) => (
                                    <tr key={index} className="border">
                                        <td className="border p-2 font-medium">{row[0]}</td>
                                        <td className="border p-2">{row[1]}</td>
                                        <td className="border p-2 text-center">{row[2]}</td>
                                        <td className="border p-2 text-center">{row[3]}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={2} className="border p-2 text-right">Total Score:</td>
                                    <td className="border p-2 text-center">100</td>
                                    <td className="border p-2 text-center">84</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comments Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Reviewer's Comments:</h2>
                    <p className="mb-2">(Strengths, weaknesses, and recommendations for improvement)</p>
                    <div className="w-full h-40 p-2 border rounded-md bg-gray-50">
                        The proposal demonstrates strong alignment with institutional priorities and has a well-structured methodology. However, the innovation aspect could be strengthened, and the budget allocation needs more detailed justification. Recommend clarifying the sustainability plan and expanding on potential industry partnerships.
                    </div>
                </div>
            </div>
        </div>
       </ReviewerLayout>
        </>
    )
}