import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getNavbarTheme = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-500';
      case 'STAFF':
        return 'bg-gradient-to-r from-green-600 to-emerald-700 border-green-500';
      case 'STUDENT':
        return 'bg-gradient-to-r from-purple-600 to-pink-700 border-purple-500';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getTextColor = () => {
    return user?.role ? 'text-white' : 'text-gray-700';
  };

  const getHoverColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'hover:text-blue-200';
      case 'staff':
        return 'hover:text-green-200';
      case 'student':
        return 'hover:text-purple-200';
      default:
        return 'hover:text-gray-900';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`${user?.role ? getNavbarTheme() : 'bg-white shadow-sm border-b border-gray-200'} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  user?.role === 'admin' ? 'bg-blue-200' :
                  user?.role === 'staff' ? 'bg-green-200' :
                  user?.role === 'student' ? 'bg-purple-200' : 'bg-blue-600'
                }`}>
                  <svg className={`w-5 h-5 ${
                    user?.role ? 'text-white' : 'text-white'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${user?.role ? 'text-white' : 'text-gray-900'}`}>Quản Lý Chứng Chỉ</h1>
                  <p className={`text-xs ${user?.role ? 'text-white/80' : 'text-gray-500'}`}>Hệ Thống Chứng Chỉ Số</p>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Trang chủ
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/certificates"
                  className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  Chứng chỉ
                </Link>
              )}

              {user?.role === 'staff' && (
                <Link
                  to="/certificates/staff"
                  className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  Chứng chỉ
                </Link>
              )}

              <Link
                to="/certificates/requests"
                className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Yêu cầu
              </Link>

              <Link
                to="/verify-diploma"
                className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Xác minh bằng cấp
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/keys"
                    className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Quản lý khóa
                  </Link>
                  <Link
                    to="/users"
                    className={`border-transparent ${user?.role ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Quản lý người dùng
                  </Link>
                </>
              )}

            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-sm font-medium ${user?.role ? 'text-white' : 'text-gray-900'}`}>{user?.username}</div>
                <div className={`text-xs ${user?.role ? 'text-white/80' : 'text-gray-500'} capitalize`}>{user?.role}</div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user?.role === 'admin' ? 'bg-blue-200' :
                user?.role === 'staff' ? 'bg-green-200' :
                user?.role === 'student' ? 'bg-purple-200' : 'bg-blue-600'
              }`}>
                <span className={`text-sm font-medium ${user?.role ? 'text-gray-900' : 'text-white'}`}>
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                user?.role ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Hồ sơ
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden border-t ${user?.role ? 'border-white/20' : 'border-gray-200'}`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 ${user?.role ? 'bg-black/10' : 'bg-gray-50'}`}>
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Trang chủ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/certificates"
              className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Chứng chỉ
            </Link>
          )}
          {user?.role === 'staff' && (
            <Link
              to="/certificates/staff"
              className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Chứng chỉ
            </Link>
          )}
          <Link
            to="/certificates/requests"
            className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Yêu cầu
          </Link>
          <Link
            to="/verify-diploma"
            className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Xác minh bằng cấp
          </Link>
          <Link
            to="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Hồ sơ
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/keys"
                className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Quản lý khóa
              </Link>
              <Link
                to="/users"
                className={`block px-3 py-2 rounded-md text-base font-medium ${user?.role ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Quản lý người dùng
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};