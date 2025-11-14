import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getColorScheme } from '../styles/colors';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  component?: React.ReactNode;
}

interface DashboardLayoutProps {
  role: 'ADMIN' | 'STAFF';
  menuItems: MenuItem[];
  children?: React.ReactNode;
  onMenuClick?: (itemId: string) => void;
  activeItem?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  menuItems,
  children,
  onMenuClick,
  activeItem: externalActiveItem
}) => {
  const [internalActiveItem, setInternalActiveItem] = useState<string>('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const colors = getColorScheme(role);

  const activeItem = externalActiveItem || internalActiveItem;

  const handleMenuClick = (item: MenuItem) => {
    if (onMenuClick) {
      onMenuClick(item.id);
    } else {
      setInternalActiveItem(item.id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const renderContent = () => {
    const activeMenuItem = menuItems.find(item => item.id === activeItem);
    if (activeMenuItem?.component) {
      return activeMenuItem.component;
    }
    return children;
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.primary }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r" style={{ borderColor: colors.border }}>
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {role === 'ADMIN' ? 'Admin Panel' : 'Staff Panel'}
          </h2>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                  activeItem === item.id
                    ? 'shadow-md'
                    : 'hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: activeItem === item.id ? colors.primary : 'transparent',
                  border: activeItem === item.id ? `2px solid ${colors.accent}` : 'none'
                }}
              >
                <div className="mr-3" style={{ color: colors.accent }}>
                  {item.icon}
                </div>
                <span
                  className="font-medium"
                  style={{ color: activeItem === item.id ? colors.accent : colors.text }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};