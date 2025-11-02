import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';

type Staff = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  staffCode: string;
  status: boolean;
  departmentId: number;
};

type Student = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  studentCode: string;
  majorName: string;
  status: boolean;
};

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');

  // Staff creation form
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    staffCode: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [staffRes, studentsRes] = await Promise.all([
        apiCall('/api/users/staff'),
        apiCall('/api/users/students')
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!staffForm.username.trim() || !staffForm.password.trim() || !staffForm.fullName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (staffForm.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const res = await apiCall('/api/users/staff', {
        method: 'POST',
        body: JSON.stringify({
          username: staffForm.username,
          password: staffForm.password,
          fullName: staffForm.fullName,
          email: staffForm.email,
          phone: staffForm.phone,
          staffCode: staffForm.staffCode,
          departmentId: 1
        })
      });

      if (res.ok) {
        setSuccess('Tạo tài khoản nhân viên thành công!');
        setStaffForm({
          username: '',
          password: '',
          fullName: '',
          email: '',
          phone: '',
          staffCode: ''
        });
        setShowStaffForm(false);
        loadUsers();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Lỗi khi tạo tài khoản nhân viên');
      }
    } catch (err) {
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600 text-lg">Quản lý tài khoản nhân viên và sinh viên</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800">{success}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'staff'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nhân viên ({staff.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sinh viên ({students.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách nhân viên</h2>
              <button
                onClick={() => setShowStaffForm(!showStaffForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showStaffForm ? 'Hủy' : 'Thêm nhân viên'}
              </button>
            </div>

            {/* Staff Creation Form */}
            {showStaffForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo tài khoản nhân viên mới</h3>
                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.username}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.fullName}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã nhân viên
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={staffForm.staffCode}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, staffCode: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowStaffForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Staff List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Đang tải...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có nhân viên nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.fullName}</div>
                            <div className="text-sm text-gray-500">@{s.username}</div>
                            {s.staffCode && (
                              <div className="text-sm text-gray-500">Mã: {s.staffCode}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{s.email}</div>
                          {s.phone && (
                            <div className="text-sm text-gray-500">{s.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {s.status ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách sinh viên</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Đang tải...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có sinh viên nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngành học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.fullName}</div>
                            <div className="text-sm text-gray-500">@{s.username}</div>
                            <div className="text-sm text-gray-500">Mã: {s.studentCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{s.majorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {s.status ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};