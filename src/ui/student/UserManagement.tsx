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
  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');

  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Toast notification system
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>>([]);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    type: 'warning' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    staffCode: ''
  });

  // Student creation form
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    studentCode: '',
    majorName: '',
    className: '',
    startYear: '',
    gpa: '',
    xepLoai: '',
    statusSV: 'ACTIVE'
  });

  // Toast notification functions
  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Confirmation modal functions
  const openConfirmModal = (title: string, message: string, type: 'warning' | 'danger', onConfirm: () => void) => {
    setConfirmModalData({ title, message, type, onConfirm });
    setShowConfirmModal(true);
  };

  const handleConfirmModal = () => {
    if (confirmModalData?.onConfirm) {
      confirmModalData.onConfirm();
    }
    setShowConfirmModal(false);
    setConfirmModalData(null);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  };

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
      addToast('error', 'Lỗi', 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!staffForm.username.trim() || !staffForm.password.trim() || !staffForm.fullName.trim()) {
      addToast('error', 'Lỗi xác thực', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (staffForm.password.length < 6) {
      addToast('error', 'Lỗi xác thực', 'Mật khẩu phải có ít nhất 6 ký tự');
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
        addToast('success', 'Thành công', 'Tạo tài khoản nhân viên thành công!');
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
        addToast('error', 'Lỗi', errorData.message || 'Lỗi khi tạo tài khoản nhân viên');
      }
    } catch (err) {
      addToast('error', 'Lỗi mạng', 'Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!studentForm.username.trim() || !studentForm.password.trim() ||
        !studentForm.fullName.trim() || !studentForm.studentCode.trim()) {
      addToast('error', 'Lỗi xác thực', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (studentForm.password.length < 6) {
      addToast('error', 'Lỗi xác thực', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const res = await apiCall('/api/users/create', {
        method: 'POST',
        body: JSON.stringify({
          username: studentForm.username,
          password: studentForm.password,
          email: studentForm.email,
          studentCode: studentForm.studentCode,
          majorName: studentForm.majorName,
          name: studentForm.fullName, // RegisterRequest expects 'name' not 'fullName'
          year: studentForm.startYear,
          xepLoai: studentForm.xepLoai,
          role: 'STUDENT'
        })
      });

      if (res.ok) {
        addToast('success', 'Thành công', 'Tạo tài khoản sinh viên thành công!');
        setStudentForm({
          username: '',
          password: '',
          fullName: '',
          email: '',
          studentCode: '',
          majorName: '',
          className: '',
          startYear: '',
          gpa: '',
          xepLoai: '',
          statusSV: 'ACTIVE'
        });
        setShowStudentForm(false);
        loadUsers();
      } else {
        const errorData = await res.json();
        addToast('error', 'Lỗi', errorData.message || 'Lỗi khi tạo tài khoản sinh viên');
      }
    } catch (err) {
      addToast('error', 'Lỗi mạng', 'Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffUsername: string, staffName: string) => {
    openConfirmModal(
      'Xác nhận xóa nhân viên',
      `Bạn có chắc chắn muốn xóa nhân viên "${staffName}"? Hành động này không thể hoàn tác.`,
      'danger',
      async () => {
        try {
          setLoading(true);
          const res = await apiCall(`/api/users/staff/${staffUsername}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            addToast('success', 'Thành công', `Xóa nhân viên "${staffName}" thành công!`);
            loadUsers();
          } else {
            const errorData = await res.json();
            addToast('error', 'Lỗi', errorData.message || 'Lỗi khi xóa nhân viên');
          }
        } catch (err) {
          addToast('error', 'Lỗi mạng', 'Lỗi mạng. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    );
  };


  const handleDeleteStudent = async (studentCode: string, studentName: string) => {
    openConfirmModal(
      'Xác nhận xóa sinh viên',
      `Bạn có chắc chắn muốn xóa sinh viên "${studentName}"? Hành động này không thể hoàn tác.`,
      'danger',
      async () => {
        try {
          setLoading(true);
          const res = await apiCall(`/api/users/student/${studentCode}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            addToast('success', 'Thành công', `Xóa sinh viên "${studentName}" thành công!`);
            loadUsers();
          } else {
            const errorData = await res.json();
            addToast('error', 'Lỗi', errorData.message || 'Lỗi khi xóa sinh viên');
          }
        } catch (err) {
          addToast('error', 'Lỗi mạng', 'Lỗi mạng. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    );
  };


  // Bulk operations
  const toggleStaffSelection = (username: string) => {
    const newSelected = new Set(selectedStaff);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
    }
    setSelectedStaff(newSelected);
  };

  const toggleStudentSelection = (studentCode: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentCode)) {
      newSelected.delete(studentCode);
    } else {
      newSelected.add(studentCode);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllStaff = () => {
    if (selectedStaff.size === staff.length) {
      setSelectedStaff(new Set());
    } else {
      setSelectedStaff(new Set(staff.map(s => s.username)));
    }
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.studentCode)));
    }
  };

  const handleBulkDeleteStaff = async () => {
    const selectedCount = selectedStaff.size;
    if (selectedCount === 0) return;

    openConfirmModal(
      'Xác nhận xóa hàng loạt nhân viên',
      `Bạn có chắc chắn muốn xóa ${selectedCount} nhân viên đã chọn? Hành động này không thể hoàn tác.`,
      'danger',
      async () => {
        try {
          setLoading(true);
          
          const deletePromises = Array.from(selectedStaff).map(username =>
            apiCall(`/api/users/staff/${username}`, { method: 'DELETE' })
          );
          
          const results = await Promise.all(deletePromises);
          const failed = results.filter(res => !res.ok);
          
          if (failed.length === 0) {
            addToast('success', 'Thành công', `Xóa ${selectedCount} nhân viên thành công!`);
          } else {
            addToast('error', 'Lỗi từng phần', `Xóa được ${selectedCount - failed.length} nhân viên, ${failed.length} thất bại`);
          }
          
          setSelectedStaff(new Set());
          loadUsers();
        } catch (err) {
          addToast('error', 'Lỗi mạng', 'Lỗi mạng khi xóa hàng loạt');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleBulkDeleteStudents = async () => {
    const selectedCount = selectedStudents.size;
    if (selectedCount === 0) return;

    openConfirmModal(
      'Xác nhận xóa hàng loạt sinh viên',
      `Bạn có chắc chắn muốn xóa ${selectedCount} sinh viên đã chọn? Hành động này không thể hoàn tác.`,
      'danger',
      async () => {
        try {
          setLoading(true);
          
          const deletePromises = Array.from(selectedStudents).map(studentCode =>
            apiCall(`/api/users/student/${studentCode}`, { method: 'DELETE' })
          );
          
          const results = await Promise.all(deletePromises);
          const failed = results.filter(res => !res.ok);
          
          if (failed.length === 0) {
            addToast('success', 'Thành công', `Xóa ${selectedCount} sinh viên thành công!`);
          } else {
            addToast('error', 'Lỗi từng phần', `Xóa được ${selectedCount - failed.length} sinh viên, ${failed.length} thất bại`);
          }
          
          setSelectedStudents(new Set());
          loadUsers();
        } catch (err) {
          addToast('error', 'Lỗi mạng', 'Lỗi mạng khi xóa hàng loạt');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600 text-lg">Quản lý tài khoản nhân viên và sinh viên</p>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`max-w-sm w-2xl shadow-lg rounded-lg pointer-events-auto border ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              } animate-fade-in`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {toast.type === 'success' && (
                      <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {toast.type === 'error' && (
                      <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {toast.type === 'info' && (
                      <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      toast.type === 'success'
                        ? 'text-green-800'
                        : toast.type === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {toast.title}
                    </p>
                    <p className={`mt-1 text-sm ${
                      toast.type === 'success'
                        ? 'text-green-700'
                        : toast.type === 'error'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      {toast.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        toast.type === 'success'
                          ? 'text-green-400 hover:text-green-600 focus:ring-green-500'
                          : toast.type === 'error'
                          ? 'text-red-400 hover:text-red-600 focus:ring-red-500'
                          : 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
                      }`}
                      onClick={() => removeToast(toast.id)}
                    >
                      <span className="sr-only">Đóng</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-300">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'staff'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Nhân viên ({staff.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                Sinh viên ({students.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-800">Danh sách nhân viên ({staff.length})</h2>
              <button
                onClick={() => setShowStaffForm(!showStaffForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showStaffForm ? 'Hủy' : 'Thêm nhân viên'}
              </button>
            </div>

            {/* Staff Creation Form */}
            {showStaffForm && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-4">Tạo tài khoản nhân viên mới</h3>
                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    <label className="block text-sm font-medium text-blue-800 mb-1">
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

            {/* Staff Bulk Actions Toolbar */}
            {selectedStaff.size > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-yellow-800">
                      Đã chọn {selectedStaff.size} nhân viên
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBulkDeleteStaff}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa đã chọn
                    </button>
                    <button
                      onClick={() => setSelectedStaff(new Set())}
                      className="px-3 py-2 text-sm font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
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
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedStaff.size === staff.length && staff.length > 0}
                          onChange={selectAllStaff}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Thông tin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStaff.has(s.username)}
                            onChange={() => toggleStaffSelection(s.username)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-blue-800">{s.fullName}</div>
                            <div className="text-sm text-gray-600">@{s.username}</div>
                            {s.staffCode && (
                              <div className="text-sm text-gray-600">Mã: {s.staffCode}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-800">{s.email}</div>
                          {s.phone && (
                            <div className="text-sm text-gray-600">{s.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {s.status ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteStaff(s.username, s.fullName)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded transition-colors bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                          >
                            Xóa
                          </button>
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-800">Danh sách sinh viên ({students.length})</h2>
              <button
                onClick={() => setShowStudentForm(!showStudentForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showStudentForm ? 'Hủy' : 'Thêm sinh viên'}
              </button>
            </div>

            {/* Student Creation Form */}
            {showStudentForm && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-4">Tạo tài khoản sinh viên mới</h3>
                <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.username}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Mã sinh viên *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.studentCode}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, studentCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Ngành học
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.majorName}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, majorName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Lớp
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.className}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, className: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Năm nhập học
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.startYear}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, startYear: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.gpa}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, gpa: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Xếp loại
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={studentForm.xepLoai}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, xepLoai: e.target.value }))}
                    >
                      <option value="">Chọn xếp loại</option>
                      <option value="Xuất sắc">Xuất sắc</option>
                      <option value="Giỏi">Giỏi</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Yếu">Yếu</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowStudentForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Đang tạo...' : 'Tạo tài khoản sinh viên'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Student Bulk Actions Toolbar */}
            {selectedStudents.size > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-yellow-800">
                      Đã chọn {selectedStudents.size} sinh viên
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBulkDeleteStudents}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa đã chọn
                    </button>
                    <button
                      onClick={() => setSelectedStudents(new Set())}
                      className="px-3 py-2 text-sm font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedStudents.size === students.length && students.length > 0}
                          onChange={selectAllStudents}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Thông tin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Ngành học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(s.studentCode)}
                            onChange={() => toggleStudentSelection(s.studentCode)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-blue-800">{s.fullName}</div>
                            <div className="text-sm text-gray-600">@{s.username}</div>
                            <div className="text-sm text-gray-600">Mã: {s.studentCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-800">{s.majorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {s.status ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteStudent(s.studentCode, s.fullName)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded transition-colors bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                          >
                            Xóa
                          </button>
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

      {/* Modal xóa */}
      {showConfirmModal && confirmModalData && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className={`p-6 border-b ${
              confirmModalData.type === 'danger' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmModalData.type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {confirmModalData.type === 'danger' ? (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${
                    confirmModalData.type === 'danger' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {confirmModalData.title}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">{confirmModalData.message}</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmModal}
                  className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                    confirmModalData.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};