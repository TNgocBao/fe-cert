import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

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

type Student = {
  id: string;
  name: string;
  studentCode: string;
  xepLoai?: string;
  role: string;
};

const CertificatePdfViewer: React.FC<{ certificateId: string; pdfUri?: string }> = ({ certificateId, pdfUri }) => {
  const [pdfExists, setPdfExists] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkPdfExists = async () => {
      try {
        const res = await fetch(`/api/certificates/${certificateId}/pdf-exists`);
        if (res.ok) {
          const data = await res.json();
          setPdfExists(data.exists);
        } else {
          setPdfExists(false);
        }
      } catch (err) {
        setPdfExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkPdfExists();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Checking PDF...</p>
        </div>
      </div>
    );
  }

  if (pdfExists) {
    return (
      <iframe
        src={`/api/certificates/${certificateId}/pdf`}
        className="w-full h-full border-0"
        title="Certificate PDF"
        onError={() => setPdfExists(false)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>PDF not available</p>
        <p className="text-xs">Certificate PDF has not been generated yet</p>
      </div>
    </div>
  );
};

export const CertificateView: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [validityInfo, setValidityInfo] = useState<{
    isValid: boolean;
    daysUntilExpiration: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await apiCall(`/api/certificates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCertificate(data);

        // Load student info - this might not exist, so handle gracefully
        try {
          const studentRes = await apiCall(`/api/students/${data.studentId}`);
          if (studentRes.ok) {
            const studentData = await studentRes.json();
            setStudent(studentData);
          }
        } catch (err) {
          // Student info not available, that's okay
          console.log('Student info not available');
        }

        // Check validity - these endpoints might not exist, so handle gracefully
        try {
          const validityRes = await apiCall(`/api/certificates/${id}/valid`);
          const daysRes = await apiCall(`/api/certificates/${id}/days-until-expiration`);

          if (validityRes.ok && daysRes.ok) {
            const isValid = await validityRes.json();
            const daysUntilExpiration = await daysRes.json();
            setValidityInfo({ isValid, daysUntilExpiration });
          }
        } catch (err) {
          // Validity endpoints not available, that's okay
          console.log('Validity check not available');
        }
      } else if (res.status === 404) {
        setError('Certificate not found');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load certificate');
      }
    } catch (err) {
      setError('Error loading certificate. Please check if the certificate exists.');
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

  const getValidityStatus = () => {
    if (!validityInfo) return null;

    if (!validityInfo.isValid) {
      return {
        status: 'Invalid',
        color: 'bg-red-100 text-red-800 border-red-200',
        message: 'This certificate is no longer valid'
      };
    }

    if (validityInfo.daysUntilExpiration <= 0) {
      return {
        status: 'Expired',
        color: 'bg-red-100 text-red-800 border-red-200',
        message: 'This certificate has expired'
      };
    }

    if (validityInfo.daysUntilExpiration <= 30) {
      return {
        status: 'Expiring Soon',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        message: `Expires in ${validityInfo.daysUntilExpiration} days`
      };
    }

    return {
      status: 'Valid',
      color: 'bg-green-100 text-green-800 border-green-200',
      message: `Valid for ${validityInfo.daysUntilExpiration} more days`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600">The certificate you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/certificates')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  const validityStatus = getValidityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/certificates')}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Certificates
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Details</h1>
          <p className="text-gray-600">Detailed view of certificate information</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Certificate ID</label>
                  <p className="mt-1 text-sm text-gray-900">{certificate.certId || certificate.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{certificate.serialNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Template ID</label>
                  <p className="mt-1 text-sm text-gray-900">{certificate.templateId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(certificate.status)}`}>
                    {certificate.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                </div>
                {certificate.expireAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expiration Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(certificate.expireAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Information */}
            {student && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Student Code</label>
                    <p className="mt-1 text-sm text-gray-900">{student.studentCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{student.name}</p>
                  </div>
                  {student.xepLoai && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Grade</label>
                      <p className="mt-1 text-sm text-gray-900">{student.xepLoai}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{student.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Information */}
            {validityStatus && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Validity Status</h2>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${validityStatus.color}`}>
                    {validityStatus.status}
                  </span>
                  <span className="ml-3 text-sm text-gray-600">{validityStatus.message}</span>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Details</h2>
              <div className="space-y-3">
                {certificate.pdfUri && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">PDF URI</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono break-all">{certificate.pdfUri}</p>
                  </div>
                )}
                {certificate.pdfSha256 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">PDF SHA256 Hash</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono break-all">{certificate.pdfSha256}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Certificate Data</label>
                  <p className="mt-1 text-sm text-gray-500">
                    Base64 encoded PDF ({certificate.certificate.length} characters)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate PDF</h2>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                <CertificatePdfViewer certificateId={certificate.id} pdfUri={certificate.pdfUri} />
              </div>
              <div className="space-y-2">
                <a
                  href={`/api/certificates/${certificate.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Open PDF in New Tab
                </a>
                {!certificate.pdfUri && (
                  <p className="text-xs text-gray-500 text-center">
                    Note: PDF may not be available if certificate hasn't been fully processed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate(`/certificates/${certificate.id}/edit`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Certificate
            </button>
          )}
          <button
            onClick={() => navigate('/certificates')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};
