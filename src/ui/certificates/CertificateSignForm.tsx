import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useApi } from '../api';

interface CertificateSignDTO {
  requestId: string;
  studentCode: string;
  staffCode: string;
  keystorePass: string;
  alias: string;
  p12File: File | null;
}

interface ApiResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    signedFilePath?: string;
  };
}

const CertificateSignForm: React.FC = () => {
  const { apiCall } = useApi();

  const [formData, setFormData] = useState<CertificateSignDTO>({
    requestId: '',
    studentCode: '',
    staffCode: '',
    keystorePass: '',
    alias: '',
    p12File: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [signedFilePath, setSignedFilePath] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSignedFilePath(null);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) form.append(key, value);
      });

      const response = await apiCall('/api/v1/requests/sign', {
        method: 'POST',
        body: form,
        headers: {}, 
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setMessage('✅ ' + result.message);
        if (result.data?.signedFilePath) {
          setSignedFilePath(result.data.signedFilePath);
          window.open(`/api/certificate-requests/${formData.requestId}/pdf`, '_blank');
        }
      } else {
        setMessage(' ' + result.message);
      }
    } catch (err: any) {
      setMessage(' ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Ký chứng chỉ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Request ID" name="requestId" value={formData.requestId} onChange={handleChange} />
        <Input label="Student Code" name="studentCode" value={formData.studentCode} onChange={handleChange} />
        <Input label="Staff Code" name="staffCode" value={formData.staffCode} onChange={handleChange} />
        <Input label="Keystore Password" name="keystorePass" value={formData.keystorePass} type="password" onChange={handleChange} />
        <Input label="Alias" name="alias" value={formData.alias} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium mb-1">File .p12</label>
          <input
            type="file"
            name="p12File"
            accept=".p12"
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Đang ký...' : 'Ký chứng chỉ'}
        </button>
      </form>

      {message && (
        <div className="mt-4 text-center text-sm">
          <span>{message}</span>
        </div>
      )}

      {signedFilePath && (
        <div className="mt-4 text-center">
          <a
            href={signedFilePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            🔗 Xem chứng chỉ đã ký
          </a>
        </div>
      )}
    </div>
  );
};

interface InputProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-2"
      required
    />
  </div>
);

export default CertificateSignForm;