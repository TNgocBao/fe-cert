import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';
import { getColorScheme } from '../../styles/colors';

type Certificate = {
  id: number;
  certId: string;
  studentCode: string;
  issueAt: string;
  expireAt?: string;
  status: string;
  serialNumber: string;
  pdfUri?: string;
  pdfSha256?: string;
};

type Result = {
  id: number;
  studentCode: string;
  courseCode: string;
  courseName: string;
  score: number;
  grade: string;
  semester: string;
  timeStudied?: string;
  xepLoai?: string;
};

type Stats = {
  totalCertificates: number;
  activeCertificates: number;
  expiringSoon: number;
  expired: number;
  totalResults: number;
  averageScore: number;
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  
  const colors = getColorScheme('STUDENT');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load certificates
      const certRes = await apiCall(`/api/${user?.studentCode}/certificates?page=0&size=5`);
      if (certRes.ok) {
        const apiResponse = await certRes.json();
        const certData = apiResponse.data;
        setRecentCertificates(certData.content || []);
        
        // Calculate certificate stats
        const allCerts = certData.content || [];
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

        const activeCertificates = allCerts.filter((cert: Certificate) => 
          cert.status === 'ISSUED' || cert.status === 'ACTIVE'
        ).length;

        // Load results
        const resultsRes = await apiCall(`/api/results/student/${user?.studentCode}/courses`);
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          const allResults = resultsData.data || [];
          setRecentResults(allResults.slice(0, 5)); // Hiển thị 5 kết quả gần nhất

          // Calculate results stats
          const totalResults = allResults.length;
          const averageScore = totalResults > 0 
            ? allResults.reduce((sum: number, result: Result) => sum + (result.score || 0), 0) / totalResults
            : 0;

          setStats({
            totalCertificates: allCerts.length,
            activeCertificates,
            expiringSoon,
            expired,
            totalResults,
            averageScore: Number(averageScore.toFixed(1))
          });
        } else {
          // Nếu không load được results, vẫn set stats cho certificates
          setStats({
            totalCertificates: allCerts.length,
            activeCertificates,
            expiringSoon,
            expired,
            totalResults: 0,
            averageScore: 0
          });
        }
      } else {
        throw new Error('Không thể tải dữ liệu chứng chỉ');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'ISSUED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REVOKED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
      case 'AVERAGE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
      case 'POOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
      case 'FAIL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilExpiration = (expire_at?: string) => {
    if (!expire_at) return null;
    const today = new Date();
    const expireDate = new Date(expire_at);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
            Xin chào, {user?.fullName || user?.name || 'Sinh viên'}
          </h1>
          <p className="text-lg" style={{ color: colors.textLight }}>
            Quản lý chứng chỉ và kết quả học tập của bạn
          </p>
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

        {/* Statistics Cards - Updated với kết quả học tập */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Certificates */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                  <svg className="w-6 h-6" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Tổng Chứng Chỉ</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats?.totalCertificates || 0}</p>
              </div>
            </div>
          </div>

          {/* Active Certificates */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Hoạt Động</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats?.activeCertificates || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Results */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Khóa Học</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats?.totalResults || 0}</p>
              </div>
            </div>
          </div>          

          {/* Expiring Soon */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFFBEB' }}>
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Sắp Hết Hạn</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats?.expiringSoon || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8" style={{ borderColor: colors.border }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Hành Động Nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/certificates')}
              className="flex items-center justify-center px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium"
              style={{ backgroundColor: colors.accent }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem Tất Cả Chứng Chỉ
            </button>

            <button
              onClick={() => navigate('/results')}
              className="flex items-center justify-center px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium"
              style={{ backgroundColor: colors.textLight }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Xem Tất Cả Kết Quả
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium"
              style={{ backgroundColor: colors.textLight }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm Mới
            </button>
          </div>
        </div>

        {/* Two Columns Layout for Certificates and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Certificates */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Chứng Chỉ Gần Đây</h2>
              <button
                onClick={() => navigate('/certificates')}
                className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                style={{ color: colors.accent, backgroundColor: colors.primary }}
              >
                Xem Tất Cả
              </button>
            </div>

            {recentCertificates.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: colors.primary }}>
                  <svg className="h-6 w-6" style={{ color: colors.textLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>Chưa có chứng chỉ nào</h3>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Các chứng chỉ của bạn sẽ hiển thị ở đây khi được cấp.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCertificates.map((cert) => {
                  const daysUntilExpiration = getDaysUntilExpiration(cert.expireAt);
                  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
                  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

                  return (
                    <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm" style={{ borderColor: colors.border }}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                          <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: colors.text }}>{cert.serialNumber}</p>
                          <p className="text-sm" style={{ color: colors.textLight }}>Mẫu: {cert.certId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                          {cert.status}
                        </span>
                        {isExpiringSoon && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            {daysUntilExpiration} ngày
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Hết hạn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Kết Quả Học Tập</h2>
              <button
                onClick={() => navigate('/results')}
                className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                style={{ color: colors.accent, backgroundColor: colors.primary }}
              >
                Xem Tất Cả
              </button>
            </div>

            {recentResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: colors.primary }}>
                  <svg className="h-6 w-6" style={{ color: colors.textLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>Chưa có kết quả nào</h3>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Kết quả học tập sẽ hiển thị ở đây.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm" style={{ borderColor: colors.border }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                        <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: colors.text }}>Tên khóa học : {result.courseName}</p>
                        <p className="text-sm" style={{ color: colors.textLight }}>
                         Mã khóa học : {result.courseCode} • Năm học : {result.semester}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg" style={{ color: colors.text }}>
                        Điểm : {result.score}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};