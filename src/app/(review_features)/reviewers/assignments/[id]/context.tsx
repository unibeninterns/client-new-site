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