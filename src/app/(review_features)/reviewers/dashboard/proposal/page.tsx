"use client";
import React, { useState } from 'react';
import Header from '@/components/reviewers/header';
import Link from 'next/link';

interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  scoreGiven?: number;
}

const ProposalReviewForm: React.FC = () => {
  const [reviewCriteria, setReviewCriteria] = useState<ReviewCriteria[]>([
    {
      id: 'relevance',
      name: 'Relevance to National/Institutional Priorities',
      description: "Alignment with Nigeria's national development goals or UNIBEN research priorities",
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'innovation',
      name: 'Originality and Innovation',
      description: 'Novelty of research idea; advancement of knowledge; creativity',
      maxScore: 15,
      scoreGiven: undefined
    },
    {
      id: 'objectives',
      name: 'Clarity of Research Problem and Objectives',
      description: 'Clearly defined problem statement and SMART objectives',
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Appropriateness, rigor, and feasibility of the research design, tools, and approach',
      maxScore: 15,
      scoreGiven: undefined
    },
    {
      id: 'literature',
      name: 'Literature Review and Theoretical Framework',
      description: 'Sound grounding in existing literature; clear conceptual framework',
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'team',
      name: 'Team Composition and Expertise',
      description: 'Appropriateness of team, interdisciplinary balance, qualifications',
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'feasibility',
      name: 'Feasibility and Timeline',
      description: 'Realistic scope, milestones, and timeline within funding duration',
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'budget',
      name: 'Budget Justification and Cost-Effectiveness',
      description: 'Clear and justified budget aligned with project goals',
      maxScore: 10,
      scoreGiven: undefined
    },
    {
      id: 'impact',
      name: 'Expected Outcomes and Impact',
      description: 'Potential contributions to policy, community, academia, industry',
      maxScore: 5,
      scoreGiven: undefined
    },
    {
      id: 'sustainability',
      name: 'Sustainability and Scalability',
      description: 'Potential for continuation, replication, or scale-up beyond funding',
      maxScore: 5,
      scoreGiven: undefined
    }
  ]);

  const [reviewComments, setReviewComments] = useState<string>('');

  const handleScoreChange = (id: string, score: number) => {
    setReviewCriteria(prev => 
      prev.map(criteria => 
        criteria.id === id 
          ? { ...criteria, scoreGiven: score } 
          : criteria
      )
    );
  };

  const calculateTotalScore = () => {
    return reviewCriteria.reduce((total, criteria) => 
      total + (criteria.scoreGiven || 0), 0
    );
  };

  const calculateMaxTotalScore = () => {
    return reviewCriteria.reduce((total, criteria) => 
      total + criteria.maxScore, 0
    );
  };

  const handleSubmit = () => {
    // Validate all scores are entered
    const allScoresEntered = reviewCriteria.every(criteria => 
      criteria.scoreGiven !== undefined
    );

    if (!allScoresEntered) {
      alert('Please enter scores for all criteria');
      return;
    }

    // Prepare submission data
    const submissionData = {
      reviewCriteria,
      reviewComments,
      totalScore: calculateTotalScore()
    };

    // TODO: Replace with actual submission logic
    console.log('Submitting review:', submissionData);
    // Typically, you would send this to an API endpoint
  };

  const handleReset = () => {
    setReviewCriteria(prev => 
      prev.map(criteria => ({ ...criteria, scoreGiven: undefined }))
    );
    setReviewComments('');
  };

  return (
    <>
        <Header userData={{
          name : "John Doe",
          role : "reviewer"
        }} />
        <div className="min-h-screen bg-gray-50 p-6">
            
            <h1 className="text-2xl md:text-4xl font-bold text-gray-700 text-center my-3">Review Proposal</h1>
                <section className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 my-7  mx-auto max-w-4xl">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-purple-700 mb-4 border-b pb-2">Proposal Details</h2>
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-gray-600">Project Summary</h3>
                                <Link href="../review-guideline" target="_blank" className="bg-gray-200 px-3 py-1 rounded-md text-purple-600 hover:text-purple-800 text-sm">
                                Review Guidelines
                                </Link>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur. Nunc aliquam a curabitur nec massa. Massa magnis nunc tellus libero volputat orci. Vitae tellus est adipiscing commodo lorem diam vitae.
                            </p>
                        </div>
                        <div className="my-4">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">
                                            <h3 className="font-semibold text-gray-600">Field of Research</h3>
                                            <p className="text-gray-800">Computer Science</p>
                                        </td>
                                        <td className="py-2">
                                            <h3 className="font-semibold text-gray-600">Budget</h3>
                                            <p className="text-gray-800">₦5,000,000.00</p>
                                        </td>
                                        <td className="py-2">
                                            <h3 className="font-semibold text-gray-600">Keywords</h3>
                                            <p className="text-gray-800">Machine Learning, AI, Data Science</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
        <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
            <h1 className="text-2xl font-bold text-purple-700 mb-6">
                Proposal Review Scoring
            </h1>
            {/* Scoring Criteria */}
            <div className="space-y-4 mb-6">
                {reviewCriteria.map((criteria) => (
                <div key={criteria.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="font-semibold text-purple-700">
                        {criteria.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                        {criteria.description}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <input 
                        type="number"
                        min="0"
                        max={criteria.maxScore}
                        value={criteria.scoreGiven ?? ''}
                        onChange={(e) => {
                            const score = parseInt(e.target.value);
                            handleScoreChange(
                            criteria.id, 
                            isNaN(score) ? 0 : Math.min(score, criteria.maxScore)
                            );
                        }}
                        className="w-20 p-2 border rounded text-center"
                        placeholder={`/${criteria.maxScore}`}
                        />
                    </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                        className="bg-purple-600 rounded-full h-2.5" 
                        style={{ 
                        width: `${criteria.scoreGiven 
                            ? (criteria.scoreGiven / criteria.maxScore) * 100 
                            : 0}%` 
                        }}
                    ></div>
                    </div>
                </div>
                ))}
            </div>

            {/* Total Score */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 flex justify-between items-center">
                <span className="font-bold text-lg">Total Score</span>
                <span className="text-xl font-bold text-purple-700">
                {calculateTotalScore()}/{calculateMaxTotalScore()}
                </span>
            </div>

            {/* Review Comments */}
            <div className="mb-6">
                <label 
                htmlFor="review-comments" 
                className="block text-lg font-semibold text-purple-700 mb-2"
                >
                Review Comments
                </label>
                <textarea 
                id="review-comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Provide detailed review comments for the proposal..."
                />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button 
                onClick={handleSubmit}
                className="flex-grow bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                Submit Review
                </button>
                <button 
                onClick={handleReset}
                className="flex-grow bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                Reset
                </button>
            </div>
            </div>
        </div>
        </div>
    </>
  );
};

export default ProposalReviewForm;