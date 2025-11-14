import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    name: '',
    dob: '',
    studentCode: '',
    majorName: '',
    year: '',
    xepLoai: '',
    staffCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  console.log(formData.studentCode+"h");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!formData.username.trim()) {
      setError('Tên đăng nhập không được để trống');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return;
    }

    if (!formData.name.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    if (formData.role === 'student' && !formData.studentCode.trim()) {
      setError('Mã sinh viên không được để trống');
      return;
    }

    if (formData.role === 'staff' && !formData.staffCode.trim()) {
      setError('Mã nhân viên không được để trống');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }

    // Date validation
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        setError('Tuổi phải từ 16 đến 100');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          dob: formData.dob,
          studentCode: formData.studentCode,
          majorName: formData.majorName,
          year: formData.year,
          xepLoai: formData.xepLoai,
          staffCode: formData.staffCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đăng ký tài khoản cho hệ thống quản lý chứng chỉ
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Sinh viên</option>
                <option value="admin">Quản trị viên</option>
                <option value="staff">Nhân viên</option>
              </select>
            </div>
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dob" className="sr-only">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Ngày sinh"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            {formData.role === 'student' && (
              <>
                <div>
                  <label htmlFor="studentCode" className="sr-only">
                    Student Code
                  </label>
                  <input
                    id="studentCode"
                    name="studentCode"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Mã sinh viên"
                    value={formData.studentCode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="majorName" className="sr-only">
                    Major
                  </label>
                  <input
                    id="majorName"
                    name="majorName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Tên ngành học"
                    value={formData.majorName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="year" className="sr-only">
                    Academic Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Năm học (vd: 2020-2024)"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="xepLoai" className="sr-only">
                    Classification
                  </label>
                  <input
                    id="xepLoai"
                    name="xepLoai"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Xếp loại (vd: Xuất sắc)"
                    value={formData.xepLoai}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            {formData.role === 'staff' && (
              <div>
                <label htmlFor="staffCode" className="sr-only">
                  Staff Code
                </label>
                <input
                  id="staffCode"
                  name="staffCode"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Mã nhân viên"
                  value={formData.staffCode || ''}
                  onChange={handleChange}
                />
              </div>
            )}
            {formData.role === 'admin' && (
              <div className="rounded-b-md">
                {/* Admin doesn't need additional fields */}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-success hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 shadow-glow-green"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-500"
            >
              Đã có tài khoản? Đăng nhập tại đây
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
