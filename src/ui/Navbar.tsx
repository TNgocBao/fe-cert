import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getColorScheme } from '../styles/colors';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Lấy color scheme theo role
  const colors = getColorScheme(user?.role || 'STAFF');

  const getTextColor = () => {
    return 'text-gray-700';
  };

  const getHoverColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'hover:text-red-600';
      case 'staff':
        return 'hover:text-blue-600';
      case 'student':
        return 'hover:text-purple-600';
      default:
        return 'hover:text-gray-900';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: colors.primary }}>
                  <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Quản Lý Chứng Chỉ</h1>
                  <p className="text-xs text-gray-500">Hệ Thống Chứng Chỉ Số</p>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
              >
                Trang chủ
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/certificates"
                  className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
                >
                  Chứng chỉ
                </Link>
              )}

              {(user?.role === 'admin' || user?.role === 'staff') && (
                <Link
                  to="/students"
                  className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
                >
                  Quản lý sinh viên
                </Link>
              )}

              {user?.role === 'staff' && (
                <Link
                  to="/certificates"
                  className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
                >
                  Chứng chỉ
                </Link>
              )}


              <Link
                to="/verify-diploma"
                className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
              >
                Xác minh bằng cấp
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/keys"
                    className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
                  >
                    Quản lý khóa
                  </Link>
                  <Link
                    to="/users"
                    className={`${getTextColor()} ${getHoverColor()} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors`}
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
                <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                <div className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor()}`}>
                  {user?.role}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <span className="text-sm font-medium" style={{ color: colors.accent }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getTextColor()} ${getHoverColor()}`}
            >
              Hồ sơ
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: colors.accent }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
          >
            Trang chủ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/certificates"
              className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
            >
              Chứng chỉ
            </Link>
          )}

          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/students"
              className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
            >
              Quản lý sinh viên
            </Link>
          )}
          {user?.role === 'staff' && (
            <Link
              to="/certificates"
              className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
            >
              Chứng chỉ
            </Link>
          )}
          <Link
            to="/verify-diploma"
            className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
          >
            Xác minh bằng cấp
          </Link>
          <Link
            to="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
          >
            Hồ sơ
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/keys"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
              >
                Quản lý khóa
              </Link>
              <Link
                to="/users"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColor()} ${getHoverColor()}`}
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