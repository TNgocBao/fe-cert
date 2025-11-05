import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

type Certificate = {
  id: string;
  certId: string;
  templateId: string;
  studentId: string;
  issuedAt: string;
  expireAt?: string;
  status: string;
  serialNo: string;
  certificate: string;
  pdfUri?: string;
  pdfSha256?: string;
};

type Stats = {
  totalCertificates: number;
  activeCertificates: number;
  expiringSoon: number;
  expired: number;
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load certificates for current user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentCode = user.username || user.studentCode;

      const certRes = await apiCall(`/api/${studentCode}/certificates?page=0&size=5`);
      if (certRes.ok) {
        const apiResponse = await certRes.json();
        console.log('Recent certificates response:', apiResponse);
        // The response is wrapped in ApiResponse format
        const certData = apiResponse.data;
        setRecentCertificates(certData ? certData.content || [] : []);
        console.log('Recent certificates:', certData ? certData.content : []);
        // Calculate stats
        const allCerts = certData ? certData.content || [] : [];
        const now = new Date();
        const expiringSoon = allCerts.filter((cert: Certificate) => {
          if (!cert.expireAt) return false;
          const expireDate = new Date(cert.expireAt);
          const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        }).length;

        const expired = allCerts.filter((cert: Certificate) => {
          if (!cert.expireAt) return false;
          const expireDate = new Date(cert.expireAt);
          return expireDate < now;
        }).length;

        const activeCertificates = allCerts.filter((cert: Certificate) => cert.status === 'ACTIVE').length;

        setStats({
          totalCertificates: allCerts.length,
          activeCertificates,
          expiringSoon,
          expired
        });
      }
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REVOKED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getDaysUntilExpiration = (expireAt?: string) => {
    if (!expireAt) return null;
    const today = new Date();
    const expireDate = new Date(expireAt);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Trang Chủ Sinh Viên
          </h1>
          <p className="text-gray-600 text-lg">Quản lý chứng chỉ và yêu cầu cấp mới</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Certificates */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng Chứng Chỉ</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalCertificates || 0}</p>
              </div>
            </div>
          </div>

          {/* Active Certificates */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chứng Chỉ Hoạt Động</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeCertificates || 0}</p>
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
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
                <p className="text-sm font-medium text-gray-500">Sắp Hết Hạn</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.expiringSoon || 0}</p>
              </div>
            </div>
          </div>

          {/* Expired */}
          <div className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã Hết Hạn</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.expired || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hành Động Nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/certificates')}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover-lift shadow-glow transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem Chứng Chỉ
            </button>

            <button
              onClick={() => navigate('/certificates/requests/create')}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover-lift shadow-glow transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yêu Cầu Chứng Chỉ
            </button>

            <button
              onClick={() => navigate('/certificates/requests/my')}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover-lift shadow-glow transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Yêu Cầu Của Tôi
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover-lift transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm Mới
            </button>
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chứng Chỉ Gần Đây</h2>
            <button
              onClick={() => navigate('/certificates')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem Tất Cả
            </button>
          </div>

          {recentCertificates.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có chứng chỉ nào</h3>
              <p className="mt-1 text-sm text-gray-500">Bạn chưa được cấp chứng chỉ nào. Hãy tạo yêu cầu chứng chỉ mới.</p>
              <button
                onClick={() => navigate('/certificates/requests/create')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo Yêu Cầu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCertificates.slice(0, 3).map((cert) => {
                const daysUntilExpiration = getDaysUntilExpiration(cert.expireAt);
                const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

                return (
                  <div key={cert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.serialNo}</p>
                        <p className="text-sm text-gray-500">Mẫu: {cert.templateId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                      {isExpiringSoon && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          Hết hạn trong {daysUntilExpiration} ngày
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Đã hết hạn
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      {cert.status === 'ISSUED' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => window.open(`/api/${cert.id}/pdf`, '_blank')}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Xem PDF
                          </button>

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};