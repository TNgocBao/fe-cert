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
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

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

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Chỉnh Sửa
                    </button>
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
      </div>
    </div>
  );
};