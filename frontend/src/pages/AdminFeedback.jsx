import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AdminFeedback() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_URL}/api/admin/feedbacks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data);
        } else {
          setError('Failed to fetch feedbacks');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: 'var(--color-body-bg)', color: 'var(--color-body-text)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: 'var(--color-body-bg)', color: 'var(--color-body-text)' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: 'var(--color-body-bg)', color: 'var(--color-body-text)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-body-bg)', color: 'var(--color-body-text)', paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Feedback Dashboard</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Breed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feedback.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feedback.predicted_breed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feedback.vote_type === 'upvote' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {feedback.vote_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{feedback.feedback_message || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(feedback.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {feedbacks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No feedbacks available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
