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

export const CertificateEdit: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [form, setForm] = useState({
    templateId: '',
    issuedAt: '',
    expireAt: '',
    status: '',
    serialNo: '',
    certificate: '',
    pdfUri: '',
    pdfSha256: ''
  });

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  useEffect(() => {
    if (certificate) {
      setForm({
        templateId: certificate.templateId,
        issuedAt: certificate.issuedAt.split('T')[0], // Extract date part
        expireAt: certificate.expireAt ? certificate.expireAt.split('T')[0] : '',
        status: certificate.status,
        serialNo: certificate.serialNo,
        certificate: certificate.certificate,
        pdfUri: certificate.pdfUri || '',
        pdfSha256: certificate.pdfSha256 || ''
      });
    }
  }, [certificate]);

  const loadCertificate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await apiCall(`/api/certificates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCertificate(data);
      } else {
        setError('Failed to load certificate');
      }
    } catch (err) {
      setError('Error loading certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !certificate) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        id: certificate.id,
        ...form,
        issuedAt: form.issuedAt ? new Date(form.issuedAt).toISOString().split('T')[0] : undefined,
        expireAt: form.expireAt ? new Date(form.expireAt).toISOString().split('T')[0] : undefined
      };

      const res = await apiCall('/api/certificates', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        setSuccess('Certificate updated successfully!');
        // Reload certificate data
        await loadCertificate();
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/certificates');
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to update certificate');
      }
    } catch (err) {
      setError('Error updating certificate');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Certificate</h1>
          <p className="text-gray-600">Update certificate information</p>
          <div className="mt-2 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Certificate ID:</strong> {certificate.certId || certificate.id}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template ID
              </label>
              <input
                type="text"
                value={form.templateId}
                onChange={(e) => setForm(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 11111111"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={form.serialNo}
                onChange={(e) => setForm(prev => ({ ...prev, serialNo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CERT_20241201_001"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={form.issuedAt}
                onChange={(e) => setForm(prev => ({ ...prev, issuedAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={form.expireAt}
                onChange={(e) => setForm(prev => ({ ...prev, expireAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PDF URI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF URI
              </label>
              <input
                type="text"
                value={form.pdfUri}
                onChange={(e) => setForm(prev => ({ ...prev, pdfUri: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PDF file URI"
              />
            </div>

            {/* PDF SHA256 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF SHA256 Hash
              </label>
              <input
                type="text"
                value={form.pdfSha256}
                onChange={(e) => setForm(prev => ({ ...prev, pdfSha256: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SHA256 hash of PDF"
              />
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Changing certificate details may affect its validity. The PDF certificate field contains the base64 encoded PDF and should not be modified unless you know what you're doing.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/certificates')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
