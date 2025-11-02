import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

type Student = {
  id: string;
  name: string;
  studentCode: string;
  xepLoai?: string;
  role: string;
};

export const CertificateCreate: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [form, setForm] = useState({
    studentId: '',
    templateId: '11111111',
    issuedAt: new Date().toISOString().slice(0, 10),
    expireAt: '',
    serialNo: `CERT_${Date.now()}`,
    certificate: 'AUTO_GENERATED'
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Auto-calculate expire date (1 year from issued date)
    if (form.issuedAt) {
      const issuedDate = new Date(form.issuedAt);
      const expireDate = new Date(issuedDate);
      expireDate.setFullYear(expireDate.getFullYear() + 1);
      setForm(prev => ({
        ...prev,
        expireAt: expireDate.toISOString().slice(0, 10)
      }));
    }
  }, [form.issuedAt]);

  const loadStudents = async () => {
    try {
      const res = await apiCall('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data || []);
      }
    } catch (err) {
      setError('Failed to load students');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiCall('/api/certificates', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Certificate created successfully! ID: ${data.id}`);
        // Reset form
        setForm({
          studentId: '',
          templateId: '11111111',
          issuedAt: new Date().toISOString().slice(0, 10),
          expireAt: '',
          serialNo: `CERT_${Date.now()}`,
          certificate: 'AUTO_GENERATED'
        });
        // Navigate to certificate list after 2 seconds
        setTimeout(() => {
          navigate('/certificates');
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to create certificate');
      }
    } catch (err) {
      setError('Error creating certificate');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === form.studentId);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Certificate</h1>
          <p className="text-gray-600">Issue a new certificate for a student</p>
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
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student *
              </label>
              <select
                value={form.studentId}
                onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentCode} - {student.name} {student.xepLoai ? `(${student.xepLoai})` : ''}
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Student:</strong> {selectedStudent.name} ({selectedStudent.studentCode})
                    {selectedStudent.xepLoai && ` - Grade: ${selectedStudent.xepLoai}`}
                  </p>
                </div>
              )}
            </div>

            {/* Template ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template ID *
              </label>
              <input
                type="text"
                value={form.templateId}
                onChange={(e) => setForm(prev => ({ ...prev, templateId: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 11111111"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={form.serialNo}
                onChange={(e) => setForm(prev => ({ ...prev, serialNo: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CERT_20241201_001"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={form.issuedAt}
                onChange={(e) => setForm(prev => ({ ...prev, issuedAt: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Certificate will be issued on this date</p>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Automatically set to 1 year from issue date</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Certificate Generation</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>The PDF certificate will be automatically generated using the selected template and student information. No manual PDF upload is required.</p>
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
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Certificate'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
