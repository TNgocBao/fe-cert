import React, { useState } from 'react';
import { DashboardLayout } from '../DashboardLayout';
import { DashboardOverview } from '../certificates/DashboardOverview';
import { StudentManagementStaff } from './StudentManagementStaff';
import { CertificateSignFormStaff } from '../certificates/CertificateSignFormStaff';
import { CertificateListAdmin } from '../admin/CertificateListAdmin';

export const StaffDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      component: <DashboardOverview role="STAFF" />
    },
    {
      id: 'sign-certificates',
      label: 'Ký Chứng Chỉ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <CertificateSignFormStaff />
    },
    {
      id: 'students',
      label: 'Quản Lý Sinh Viên',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      component: <StudentManagementStaff />
    },
    {
      id: 'certificates',
      label: 'Quản Lý Chứng Chỉ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <CertificateListAdmin/>
    }
  ];

  const renderActiveComponent = () => {
    const activeItem = menuItems.find(item => item.id === activeSection);
    return activeItem?.component || <DashboardOverview role="STAFF" />;
  };

  return (
    <DashboardLayout
      role="STAFF"
      menuItems={menuItems.map(item => ({
        ...item,
        component: undefined // Remove component from menu items since we handle rendering separately
      }))}
      onMenuClick={(itemId) => setActiveSection(itemId)}
      activeItem={activeSection}
    >
      {renderActiveComponent()}
    </DashboardLayout>
  );
};