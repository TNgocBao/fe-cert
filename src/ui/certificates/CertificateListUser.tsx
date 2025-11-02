import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';

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

export const CertificateListUser: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/certificates/my?page=0&size=50');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.content || []);
      } else {
        setError('Không thể tải danh sách chứng chỉ');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách chứng chỉ');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Chứng Chỉ Của Tôi</h1>
          <p className="text-gray-600 text-lg">Xem và quản lý các chứng chỉ cá nhân</p>
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

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-purple-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy chứng chỉ nào</h3>
            <p className="mt-2 text-gray-500">Bạn chưa được cấp chứng chỉ nào. Hãy tạo yêu cầu chứng chỉ mới.</p>
            <button
              onClick={() => window.location.href = '/certificates/requests/create'}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo Yêu Cầu Chứng Chỉ
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const daysUntilExpiration = getDaysUntilExpiration(cert.expireAt);
              const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;
              const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

              return (
                <div key={cert.id} className="bg-white rounded-xl shadow-lg hover-lift border border-gray-200 overflow-hidden animate-fade-in">
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
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
                    </div>

                    {/* Certificate Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.serialNo}</h3>
                        <p className="text-sm text-gray-500">Certificate ID: {cert.certId || cert.id}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Mẫu:</span>
                          <span className="font-medium">{cert.templateId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ngày cấp:</span>
                          <span className="font-medium">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                        </div>
                        {cert.expireAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ngày hết hạn:</span>
                            <span className="font-medium">{new Date(cert.expireAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <a
                          href={`/api/certificates/${cert.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover-lift shadow-glow transition-all duration-300"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem PDF
                        </a>
                        <a
                          href={`/api/certificates/download/${cert.id}`}
                          download={`certificate_${cert.serialNo || cert.id}.pdf`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover-lift shadow-glow transition-all duration-300"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tải Xuống
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
