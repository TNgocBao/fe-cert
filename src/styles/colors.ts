// Color Scheme theo quy tắc 6-3-1 - Basic and professional
export const colorSchemes = {
  STUDENT: {
    primary: '#F8FAFC',    // 60% - Xám nhạt (màu chủ đạo)
    secondary: '#FFFFFF',  // 30% - Trắng (màu phụ)
    accent: '#64748B',     // 10% - Xám đậm (màu nhấn)
    text: '#334155',       // Text chủ đạo
    textLight: '#64748B',  // Text phụ
    success: '#10B981',    // Xanh lá cho success
    warning: '#F59E0B',    // Vàng cho warning
    error: '#EF4444',      // Đỏ cho error
    bg: '#F8FAFC',         // Background chính
    border: '#E2E8F0'      // Màu border
  },

  STAFF: {
    primary: '#F8FAFC',    // 60% - Xám nhạt (màu chủ đạo)
    secondary: '#FFFFFF',  // 30% - Trắng (màu phụ)
    accent: '#475569',     // 10% - Xám xanh (màu nhấn)
    text: '#334155',       // Text chủ đạo
    textLight: '#64748B',  // Text phụ
    success: '#10B981',    // Xanh lá cho success
    warning: '#F59E0B',    // Vàng cho warning
    error: '#EF4444',      // Đỏ cho error
    bg: '#F8FAFC',         // Background chính
    border: '#E2E8F0'      // Màu border
  },

  ADMIN: {
    primary: '#F8FAFC',    // 60% - Xám nhạt (màu chủ đạo)
    secondary: '#FFFFFF',  // 30% - Trắng (màu phụ)
    accent: '#374151',     // 10% - Xám tối (màu nhấn)
    text: '#111827',       // Text chủ đạo
    textLight: '#6B7280',  // Text phụ
    success: '#10B981',    // Xanh lá cho success
    warning: '#F59E0B',    // Vàng cho warning
    error: '#EF4444',      // Đỏ cho error
    bg: '#F8FAFC',         // Background chính
    border: '#E2E8F0'      // Màu border
  }
};

// Function lấy color scheme theo role
export const getColorScheme = (role: string) => {
  switch (role?.toUpperCase()) {
    case 'STUDENT':
      return colorSchemes.STUDENT;
    case 'STAFF':
      return colorSchemes.STAFF;
    case 'ADMIN':
      return colorSchemes.ADMIN;
    default:
      return colorSchemes.STAFF;
  }
};

// CSS classes
export const getThemeClasses = (role: string) => {
  const colors = getColorScheme(role);
  return {
    // Background
    bgPrimary: `bg-[${colors.primary}]`,
    bgSecondary: `bg-[${colors.secondary}]`,
    bgAccent: `bg-[${colors.accent}]`,
    bgMain: `bg-[${colors.bg}]`,
    
    // Text
    textPrimary: `text-[${colors.text}]`,
    textSecondary: `text-[${colors.textLight}]`,
    textAccent: `text-[${colors.accent}]`,
    
    // Border
    borderPrimary: `border-[${colors.border}]`,
    borderAccent: `border-[${colors.accent}]`,
    
    // Button styles
    btnPrimary: `bg-[${colors.accent}] text-white hover:bg-[${colors.accent}]/90`,
    btnSecondary: `bg-[${colors.primary}] text-[${colors.text}] border border-[${colors.accent}] hover:bg-[${colors.accent}]/10`,
    
    // Card styles
    card: `bg-[${colors.secondary}] border border-[${colors.border}] rounded-lg shadow-sm`,
    cardAccent: `bg-[${colors.secondary}] border border-[${colors.accent}] rounded-lg shadow-md`,
  };
};