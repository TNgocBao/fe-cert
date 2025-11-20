import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { CertificatePdfActions } from "../certificates/CertificatePdfActions";

type Certificate = {
  id: number;
  certId: string;
  templateId: string;
  studentId: string;
  issued_at: string;
  expire_at?: string;
  status: string;
  serialNumber: string;
  pdfUri?: string;
  pdfSha256?: string;
};

type Student = {
  id: number;
  fullName: string;
  studentCode: string;
  xepLoai?: string;
};

export const CertificateListAdmin: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Map<string, Student>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Tách state: inputValue cho ô nhập, filterStudentId cho filter thực tế
  const [inputValue, setInputValue] = useState<string>("");
  const [filterStudentId, setFilterStudentId] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCertificates();
  }, [filterStudentId, currentPage]); // Chỉ phụ thuộc vào filterStudentId thực tế, không phải inputValue

  const loadCertificates = async () => {
    try {
      setLoading(true);
      let url = `/api/certificates?page=${currentPage}&size=${itemsPerPage}`;
      if (filterStudentId) {
        url += `&studentId=${encodeURIComponent(filterStudentId)}`;
      }

      const res = await apiCall(url);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalElements || 0);

        // Load student info for certificates
        const studentIds = [
          ...new Set(
            (data.content || [])
              .map((c: Certificate) => c.studentId)
              .filter((id: any) => id)
          ),
        ];
        await loadStudents(studentIds as string[]);
      } else {
        setError("Failed to load certificates");
      }
    } catch (err) {
      setError("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (studentIds: string[]) => {
    const studentMap = new Map<string, Student>();
    try {
      const res = await apiCall("/api/users/students");
      if (res.ok) {
        const allStudents = await res.json();
        allStudents.forEach((student: any) => {
          if (
            studentIds.includes(student.studentCode) ||
            studentIds.includes(student.id?.toString())
          ) {
            studentMap.set(student.studentCode, student);
            studentMap.set(student.id?.toString(), student);
          }
        });
      }
    } catch (err) {
      console.warn("Could not load student info:", err);
    }
    setStudents(studentMap);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    // Chỉ set filterStudentId khi người dùng thực sự tìm kiếm
    setFilterStudentId(inputValue);
    setCurrentPage(0);
    // Không cần gọi loadCertificates() vì useEffect sẽ tự động chạy
  };

  const handleClear = () => {
    // Reset cả inputValue và filterStudentId
    setInputValue("");
    setFilterStudentId("");
    setCurrentPage(0);
    // Không cần gọi loadCertificates() vì useEffect sẽ tự động chạy
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
    
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return `${baseClasses} bg-emerald-100 text-emerald-800 border-emerald-200`;
      case "EXPIRED":
        return `${baseClasses} bg-rose-100 text-rose-800 border-rose-200`;
      case "REVOKED":
        return `${baseClasses} bg-slate-100 text-slate-800 border-slate-300`;
      case "PENDING":
        return `${baseClasses} bg-amber-100 text-amber-800 border-amber-200`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
    }
  };

  const getStudentInfo = (studentId: string) => {
    const student = students.get(studentId);
    return student || { fullName: "Đang tải...", studentCode: studentId };
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Quản Lý Chứng Chỉ
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý và theo dõi tất cả chứng chỉ trong hệ thống
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2">
              <div className="text-sm text-slate-500">Tổng số</div>
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-xs text-slate-400">chứng chỉ</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tìm kiếm theo mã sinh viên
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue} // Sử dụng inputValue thay vì filterStudentId
                  onChange={(e) => setInputValue(e.target.value)} // Chỉ cập nhật inputValue
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập mã sinh viên..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-0 py-3 rounded-lg hover:bg-blue-700 transition-colors 
                duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Tìm kiếm</span>
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{certificates.length}</span> chứng chỉ 
            {filterStudentId && (
              <span> cho mã sinh viên "<span className="font-semibold">{filterStudentId}</span>"</span>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Trang {currentPage + 1} / {totalPages}
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Thông tin chứng chỉ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {certificates.map((cert) => {
                  const studentInfo = getStudentInfo(cert.studentId);
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-semibold text-slate-900">
                              {cert.serialNumber}
                            </div>
                          </div>
                          <div className="text-xs text-slate-700 font-mono">
                            ID: {cert.certId}
                          </div>
                          <div className="text-xs text-slate-700">
                            Template: {cert.templateId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900">
                            {studentInfo.fullName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                            {studentInfo.studentCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(cert.status)}>
                          {cert.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Cấp: {new Date(cert.issued_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {cert.expire_at && (
                            <div className="flex items-center space-x-1">
                              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Hết hạn: {new Date(cert.expire_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <CertificatePdfActions
                            certId={cert.certId}
                            studentCode={cert.studentId}
                            className="w-full"
                            viewButtonText="Xem PDF"
                            buttonSize="sm"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {certificates.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 text-slate-300 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Không tìm thấy chứng chỉ
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {filterStudentId 
                  ? `Không có chứng chỉ nào cho mã sinh viên "${filterStudentId}". Hãy thử tìm kiếm với mã khác.`
                  : "Hiện chưa có chứng chỉ nào trong hệ thống. Bắt đầu bằng cách tạo chứng chỉ mới."
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị <span className="font-semibold">{(currentPage * itemsPerPage) + 1}</span> -{" "}
              <span className="font-semibold">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> của{" "}
              <span className="font-semibold">{totalItems}</span> kết quả
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Trước</span>
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Sau</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};