import React from 'react';

interface CertificatePdfActionsProps {
  certId: string;
  studentCode: string;
  className?: string;
  showViewButton?: boolean;
  viewButtonText?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  baseUrl?: string;
}

export const CertificatePdfActions: React.FC<CertificatePdfActionsProps> = ({
  certId,
  studentCode,
  className = '',
  showViewButton = true,
  viewButtonText = 'Xem PDF',
  buttonSize = 'sm',
  baseUrl = '/api',
}) => {
   
  const viewPdf = async () => {
   
    // Trim values để tránh lỗi khoảng cách
    const trimmedCertId = certId?.trim();
    const trimmedStudentCode = studentCode?.trim();
    
    if (!trimmedCertId || !trimmedStudentCode) {
      alert('Thiếu thông tin để xem chứng chỉ');
      return;
    }

    try {
      const url = `${baseUrl}/certificates/${trimmedCertId}/view`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          studentCode: trimmedStudentCode 
        }),
      });

      

      if (response.ok) {
        // Tạo blob từ response và mở trong tab mới
        const blob = await response.blob();
      
        if (blob.size === 0) {
          throw new Error('PDF trống hoặc không tồn tại');
        }

        // Tạo URL từ blob và mở trong tab mới
        const blobUrl = window.URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow) {
          alert('Trình duyệt chặn mở cửa sổ mới. Vui lòng cho phép popup.');
          return;
        }

        // Dọn dẹp blob URL sau 10 phút
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 10 * 60 * 1000);

      } else {
        // Xử lý lỗi HTTP
        const errorText = await response.text();
        
        if (response.status === 404) {
          throw new Error('Không tìm thấy chứng chỉ hoặc file PDF');
        } else if (response.status === 500) {
          throw new Error('Lỗi server: ' + errorText);
        } else {
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }
    } catch (err) {
      alert('Lỗi khi xem PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getButtonClasses = (variant: 'view' | 'download') => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
      view: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      download: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };

    return `${baseClasses} ${sizeClasses[buttonSize]} ${variantClasses[variant]}`;
  };

  const getIconClasses = () => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    return sizeClasses[buttonSize];
  };

  const isDisabled = !certId?.trim() || !studentCode?.trim();

  return (
    <div className={`flex space-x-2 ${className}`}>
      {showViewButton && (
        <button
          onClick={viewPdf}
          className={getButtonClasses('view')}
          disabled={isDisabled}
          title={isDisabled ? 'Thiếu certId hoặc studentCode' : 'Xem PDF chứng chỉ'}
        >
          <svg className={`${getIconClasses()} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {viewButtonText}
        </button>
      )}
      
    </div>
  );
};