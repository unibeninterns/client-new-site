"use client";

interface DiscrepancyAlertProps {
  previousScores: {
    reviewerA: {
      name: string;
      scores: Record<string, number>;
    };
    reviewerB: {
      name: string;
      scores: Record<string, number>;
    };
  };
}

const DiscrepancyAlert = ({ previousScores }: DiscrepancyAlertProps) => {
  // Calculate the criteria with significant differences
  const getDiscrepancies = () => {
    const discrepancies: Array<{ criterion: string; difference: number }> = [];
    
    Object.entries(previousScores.reviewerA.scores).forEach(([criterion, scoreA]) => {
      const scoreB = previousScores.reviewerB.scores[criterion];
      const difference = Math.abs(scoreA - scoreB);
      
      // Consider a difference of 30% or more as significant
      if (difference >= 3) {
        discrepancies.push({ criterion, difference });
      }
    });
    
    return discrepancies;
  };

  const discrepancies = getDiscrepancies();

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 mx-auto max-w-4xl">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Review Discrepancy Alert
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Significant differences were found between previous reviews. Please pay special attention to the following criteria:
            </p>
            <ul className="list-disc list-inside mt-2">
              {discrepancies.map(({ criterion, difference }) => (
                <li key={criterion}>
                  <span className="font-medium">{criterion}</span>: {difference} point difference
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3">
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-medium text-yellow-800">{previousScores.reviewerA.name}:</span> First Review
              </div>
              <div>
                <span className="font-medium text-yellow-800">{previousScores.reviewerB.name}:</span> Second Review
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscrepancyAlert;
