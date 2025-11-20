import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';

type UserProfile = {
  id: string;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  studentCode?: string;
  staffCode?: string;
  department?: string;
  major?: string;
  startYear?: string;
  xepLoai?: string;
  createdAt?: string;
  lastLogin?: string;
};

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Toast notification system
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info";
      title: string;
      message: string;
    }>
  >([]);

  // Toast notification functions
  const addToast = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading user profile...');
      const res = await apiCall('/api/users/profile');
      console.log(' Profile API response:', res.status, res.statusText);
      if (res.ok) {
        const data = await res.json();
        console.log('Profile data received:', data);
        setProfile(data);
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } else {
        console.error('Failed to load profile:', res.status, res.statusText);
        setError('Không thể tải thông tin hồ sơ');
      }
    } catch (err) {
      console.error(' Error loading profile:', err);
      setError('Lỗi khi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log(' Updating profile with data:', editForm);
      const res = await apiCall('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });

      console.log(' Update profile response:', res.status, res.statusText);
      if (res.ok) {
        const updatedProfile = await res.json();
        console.log(' Profile updated successfully:', updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
        setError('');
        // Reload profile to ensure fresh data
        await loadProfile();
      } else {
        console.error(' Failed to update profile:', res.status, res.statusText);
        setError('Không thể cập nhật hồ sơ');
      }
    } catch (err) {
      console.error(' Error updating profile:', err);
      setError('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors = { oldPassword: '', newPassword: '', confirmPassword: '' };

    if (!passwordForm.oldPassword.trim()) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);

    // If there are validation errors, don't submit
    if (errors.oldPassword || errors.newPassword || errors.confirmPassword) {
      return;
    }

    try {
      setLoading(true);
      const res = await apiCall('/api/users/student/change-password', {
        method: 'PATCH',
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setShowChangePassword(false);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError('');
        // Show success message
        addToast('success', 'Thành công', 'Mật khẩu đã được thay đổi thành công!');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Không thể thay đổi mật khẩu');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Lỗi khi thay đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-80 shadow-lg rounded-lg pointer-events-auto border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200"
                : toast.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === "success" && (
                    <svg
                      className="h-6 w-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {toast.type === "error" && (
                    <svg
                      className="h-6 w-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  {toast.type === "info" && (
                    <svg
                      className="h-6 w-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      toast.type === "success"
                        ? "text-green-800"
                        : toast.type === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    {toast.title}
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      toast.type === "success"
                        ? "text-green-700"
                        : toast.type === "error"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      toast.type === "success"
                        ? "text-green-400 hover:text-green-600 focus:ring-green-500"
                        : toast.type === "error"
                        ? "text-red-400 hover:text-red-600 focus:ring-red-500"
                        : "text-blue-400 hover:text-blue-600 focus:ring-blue-500"
                    }`}
                    onClick={() => removeToast(toast.id)}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600 text-lg">Xem và quản lý thông tin cá nhân của bạn</p>
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

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name || profile.username}</h2>
                  <p className="text-gray-600 mb-2">@{profile.username}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    profile.role === 'STAFF' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role === 'ADMIN' ? 'Quản Trị Viên' :
                     profile.role === 'STAFF' ? 'Nhân Viên' : 'Sinh Viên'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Thông Tin Cá Nhân</h3>
                  {!isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Đổi Mật Khẩu
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chỉnh Sửa
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: profile.name || '',
                            email: profile.email || '',
                            phone: profile.phone || ''
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên đăng nhập
                        </label>
                        <p className="text-gray-900">{profile.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <p className="text-gray-900">{profile.name || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <p className="text-gray-900">{profile.email || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <p className="text-gray-900">{profile.phone || 'Chưa cập nhật'}</p>
                      </div>
                      {profile.studentCode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã sinh viên
                          </label>
                          <p className="text-gray-900">{profile.studentCode}</p>
                        </div>
                      )}
                      {profile.staffCode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã nhân viên
                          </label>
                          <p className="text-gray-900">{profile.staffCode}</p>
                        </div>
                      )}
                      {profile.major && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngành học
                          </label>
                          <p className="text-gray-900">{profile.major}</p>
                        </div>
                      )}
                      {profile.startYear && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Năm học
                          </label>
                          <p className="text-gray-900">{profile.startYear}</p>
                        </div>
                      )}
                      {profile.xepLoai && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xếp loại
                          </label>
                          <p className="text-gray-900">{profile.xepLoai}</p>
                        </div>
                      )}
                      {profile.department && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phòng ban
                          </label>
                          <p className="text-gray-900">{profile.department}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.createdAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ngày tạo tài khoản
                            </label>
                            <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        )}
                        {profile.lastLogin && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Đăng nhập cuối
                            </label>
                            <p className="text-gray-900">{new Date(profile.lastLogin).toLocaleString('vi-VN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Đổi Mật Khẩu
                </h3>
                <p className="text-sm mt-1 text-gray-600">
                  Nhập mật khẩu cũ và mật khẩu mới của bạn
                </p>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật Khẩu Cũ *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }));
                      if (passwordErrors.oldPassword) {
                        setPasswordErrors(prev => ({ ...prev, oldPassword: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      passwordErrors.oldPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Nhập mật khẩu cũ"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-sm text-red-600 mt-1">{passwordErrors.oldPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật Khẩu Mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      if (passwordErrors.newPassword) {
                        setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác Nhận Mật Khẩu Mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({
                        oldPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {loading ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};