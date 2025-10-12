import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FeedbackForm = ({ prediction }) => {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [vote, setVote] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!vote) {
      setError('Please select upvote or downvote');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prediction,
          vote,
          message
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
        <p className="text-green-800 font-medium">Thank you for your feedback! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Feedback</h3>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setVote('upvote')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            vote === 'upvote'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          👍 Upvote (Correct)
        </button>
        <button
          onClick={() => setVote('downvote')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            vote === 'downvote'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 hover:border-red-400'
          }`}
        >
          👎 Downvote (Incorrect)
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional feedback (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us more..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !vote}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
};

export default FeedbackForm;
