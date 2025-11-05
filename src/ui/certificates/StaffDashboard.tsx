import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

type Stats = {
  pendingRequests: number;
  approvedToday: number;
  totalCertificates: number;
};

type RecentRequest = {
  id: string;
  studentName: string;
  requestType: string;
  status: string;
  requestedAt: string;
  templateName: string;
};

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsRes = await apiCall('/api/staff/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load recent requests
      const requestsRes = await apiCall('/api/requests/recent?page=0&size=5');
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRecentRequests(requestsData.content || []);
      }
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'NEW_CERTIFICATE':
        return 'New Certificate';
      case 'RENEWAL':
        return 'Renewal';
      case 'REPLACEMENT':
        return 'Replacement';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Trang Nhân Viên</h1>
          <p className="text-gray-600 text-lg">Duyệt yêu cầu và ký chứng chỉ</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Yêu Cầu Chờ Duyệt</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
              </div>
            </div>
          </div>

          {/* Approved Today */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã Duyệt Hôm Nay</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.approvedToday || 0}</p>
              </div>
            </div>
          </div>

          {/* Certificates Signed */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chứng Chỉ Đã Ký</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalCertificates || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hành Động Nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/certificates/requests')}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover-lift shadow-glow transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Duyệt Yêu Cầu
            </button>



            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-lg hover-lift transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm Mới
            </button>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Yêu Cầu Gần Đây</h2>
            <button
              onClick={() => navigate('/certificates/requests')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem Tất Cả
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu gần đây</h3>
              <p className="mt-1 text-sm text-gray-500">Yêu cầu mới sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.studentName}</p>
                      <p className="text-sm text-gray-500">{getRequestTypeLabel(request.requestType)} - {request.templateName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};