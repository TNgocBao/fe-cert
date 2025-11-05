import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

type CertificateRequest = {
  id: string;
  studentId: string;
  templateId: string;
  requestType: string;
  status: string;
  reason?: string;
  adminNotes?: string;
  directorNotes?: string;
  approvedBy?: string;
  directorApprovedBy?: string;
  createdAt: string;
  reviewedAt?: string;
  directorReviewedAt?: string;
  completedAt?: string;
  serialNo?: string;
  certificateId?: string;
  studentName?: string;
  studentCode?: string;
  templateName?: string;
};

export const StudentRequestList: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadRequests();
  }, []);

 const loadRequests = async () => {
  try {
    setLoading(true);
    const res = await apiCall('/api/certificate-requests/my');
    if (res.ok) {
      const data = await res.json();
      console.log('Student requests data:', data);

      // Map backend data sang frontend format
      const mappedRequests = data.map((r: any) => ({
        id: r.requestCode || r.id.toString(), // dùng requestCode nếu có, fallback id
        studentId: r.studentId,
        templateId: r.templateId,
        requestType: r.requestType,
        status: r.status || 'PENDING',        // fallback PENDING nếu backend chưa gửi
        createdAt: r.createdAt,             // map từ createdAt
        reviewedAt: r.reviewedAt,
        directorReviewedAt: r.directorReviewedAt,
        completedAt: r.completedAt,
        serialNo: r.serialNo,
        certificateId: r.certificateId,
        studentName: r.studentName,
        studentCode: r.studentCode,
        templateName: r.templateName || 'Chứng chỉ tốt nghiệp',
        adminNotes: r.adminNotes,
        directorNotes: r.directorNotes,
      }));

      setRequests(mappedRequests);
    } else {
      console.error('Failed to load requests:', res.status, res.statusText);
      setError('Không thể tải danh sách yêu cầu');
    }
  } catch (err) {
    console.error('Error loading requests:', err);
    setError('Lỗi khi tải danh sách yêu cầu');
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
      case 'DIRECTOR_APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DIRECTOR_REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ Duyệt';
      case 'APPROVED':
        return 'Đã Duyệt';
      case 'REJECTED':
        return 'Từ Chối';
      case 'DIRECTOR_APPROVED':
        return 'Giám Đốc Duyệt';
      case 'DIRECTOR_REJECTED':
        return 'Giám Đốc Từ Chối';
      case 'COMPLETED':
        return 'Hoàn Thành';
      default:
        return status;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'NEW_CERTIFICATE':
        return 'Chứng Chỉ Mới';
      case 'RENEWAL':
        return 'Gia Hạn Chứng Chỉ';
      case 'REPLACEMENT':
        return 'Thay Thế Chứng Chỉ';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            Yêu Cầu Chứng Chỉ Của Tôi
          </h1>
          <p className="text-gray-600 text-lg">Xem và theo dõi trạng thái các yêu cầu chứng chỉ đã gửi</p>
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

        {/* Create Request Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/certificates/requests/create')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo Yêu Cầu Mới
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mx-auto h-24 w-24 text-blue-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa gửi yêu cầu chứng chỉ nào. Hãy tạo yêu cầu mới để bắt đầu.</p>
            <button
              onClick={() => navigate('/certificates/requests/create')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo Yêu Cầu Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    <span className="text-xs text-gray-600">#{request.id.slice(-6)}</span>
                  </div>

                  {/* Request Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800 mb-1">
                        {getRequestTypeLabel(request.requestType)}
                      </h3>
                      <p className="text-sm text-gray-600">Mẫu: {request.templateName || 'Chứng chỉ tốt nghiệp'}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày yêu cầu:</span>
                        <span className="font-medium text-blue-800">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>

                      {request.reviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày duyệt:</span>
                          <span className="font-medium text-blue-800">{new Date(request.reviewedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}

                      {request.directorReviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giám đốc duyệt:</span>
                          <span className="font-medium text-blue-800">{new Date(request.directorReviewedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}

                      {request.serialNo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Serial:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{request.serialNo}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {(request.adminNotes || request.directorNotes) && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Ghi chú:</h4>
                        {request.adminNotes && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Admin:</span> {request.adminNotes}
                          </p>
                        )}
                        {request.directorNotes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Giám đốc:</span> {request.directorNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    {request.certificateId && (
                      <a
                        href={`/certificates/${request.certificateId}`}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem Chứng Chỉ
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};