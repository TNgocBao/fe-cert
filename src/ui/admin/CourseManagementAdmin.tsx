import React, { useEffect, useState } from "react";
import { useApi } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Course = {
  id: number;
  courseName: string;
  courseCode: string;
  description?: string;
  staffCode: string;
  startDate?: string;
  endDate?: string;
};

type Staff = {
  id: number;
  fullName: string;
  staffCode: string;
};

export const CourseManagementAdmin: React.FC = () => {
  const { apiCall } = useApi();
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Tất cả courses
  const [courses, setCourses] = useState<Course[]>([]); // Courses hiển thị trên trang hiện tại
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
    staffCode: "",
    startDate: "",
    endDate: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    endDate: "",
  });

  // Pagination state - phân trang trên FE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalItems = allCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    courseCode?: string;
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    courseCode: "",
    loading: false,
  });

  // Toast notification system
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info";
      title: string;
      message: string;
    }>
  >([]);

  // Toast notification functions
  const addToast = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Effect để cập nhật courses hiển thị khi allCourses hoặc currentPage thay đổi
  useEffect(() => {
    updateDisplayedCourses();
  }, [allCourses, currentPage]);

  const updateDisplayedCourses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCourses = allCourses.slice(startIndex, endIndex);
    setCourses(currentCourses);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStaff(), loadCourses()]);
    } catch (err) {
      setError("Failed to load initial data");
      addToast("error", "Error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await apiCall("/api/users/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.warn("Could not load staff:", err);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await apiCall("http://localhost:8080/courses");
      if (res.ok) {
        const responseData = await res.json();
        const coursesData = responseData.data?.content || responseData.content || responseData || [];
        setAllCourses(coursesData); // Lưu tất cả courses
        setCurrentPage(1); // Reset về trang đầu khi tải dữ liệu mới
      }
    } catch (err) {
      console.error("Could not load courses:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");

      // Validate dates
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (endDate <= startDate) {
          setValidationErrors({ endDate: "Ngày kết thúc phải lớn hơn ngày bắt đầu" });
          // setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
          addToast("error", "Lỗi", "Ngày kết thúc phải lớn hơn ngày bắt đầu");
          return;
        }
      }

      // Clear validation errors if validation passes
      setValidationErrors({ endDate: "" });

      if (editingCourse) {
        // UPDATE course
        const res = await apiCall(
          `http://localhost:8080/courses/${editingCourse.courseCode}/update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        
        if (res.ok) {
          setShowForm(false);
          setEditingCourse(null);
          setFormData({
            courseName: "",
            courseCode: "",
            description: "",
            staffCode: "",
            startDate: "",
            endDate: "",
          });
          setValidationErrors({ endDate: "" });
          addToast("success", "Success", "Course updated successfully!");
          loadCourses(); // Tải lại toàn bộ dữ liệu
        } else {
          setError("Failed to update course");
          addToast("error", "Error", "Failed to update course!");
        }
      } else {
        // CREATE new course
        const res = await apiCall("http://localhost:8080/courses/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setShowForm(false);
          setFormData({
            courseName: "",
            courseCode: "",
            description: "",
            staffCode: "",
            startDate: "",
            endDate: "",
          });
          setValidationErrors({ endDate: "" });
          addToast("success", "Success", "Course created successfully!");
          loadCourses(); // Tải lại toàn bộ dữ liệu
        } else {
          setError("Trùng id");
          addToast("error", "Error", "Failed to create course!");
        }
      }
    } catch (err) {
      setError("Error processing request");
      addToast("error", "Error", "Error processing request!");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      description: course.description || "",
      staffCode: course.staffCode,
      startDate: course.startDate || "",
      endDate: course.endDate || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (courseCode: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa Khóa Học",
      message: "Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.",
      courseCode: courseCode,
      loading: false,
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.courseCode) return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));

      const res = await apiCall(
        `http://localhost:8080/courses/${confirmDialog.courseCode}/delete`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        addToast("success", "Thành công", "Khóa học đã được xóa thành công!");
        loadCourses(); // Tải lại toàn bộ dữ liệu
      } else {
        // setError("Failed to delete course");
        addToast("error", "Lỗi", "Không thể xóa khóa học!");
      }
    } catch (err) {
      setError("Error deleting course");
      addToast("error", "Lỗi", "Có lỗi xảy ra khi xóa khóa học!");
    } finally {
      setConfirmDialog({
        isOpen: false,
        title: "",
        message: "",
        courseCode: "",
        loading: false,
      });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      courseCode: "",
      loading: false,
    });
  };

  const handleCancel = () => {
    setFormData({
      courseName: "",
      courseCode: "",
      description: "",
      staffCode: "",
      startDate: "",
      endDate: "",
    });
    setValidationErrors({ endDate: "" });
    setEditingCourse(null);
    setShowForm(false);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Calculate displayed range
  const getDisplayedRange = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
    return { startIndex, endIndex };
  };

  const { startIndex, endIndex } = getDisplayedRange();

  if (loading && allCourses.length === 0) {
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
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`max-w-sm w-80 shadow-lg rounded-lg pointer-events-auto border ${
                toast.type === "success"
                  ? "bg-green-50 border-green-200"
                  : toast.type === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {toast.type === "success" && (
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {toast.type === "error" && (
                      <svg
                        className="h-6 w-6 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    {toast.type === "info" && (
                      <svg
                        className="h-6 w-6 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        toast.type === "success"
                          ? "text-green-800"
                          : toast.type === "error"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {toast.title}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        toast.type === "success"
                          ? "text-green-700"
                          : toast.type === "error"
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}
                    >
                      {toast.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        toast.type === "success"
                          ? "text-green-400 hover:text-green-600 focus:ring-green-500"
                          : toast.type === "error"
                          ? "text-red-400 hover:text-red-600 focus:ring-red-500"
                          : "text-blue-400 hover:text-blue-600 focus:ring-blue-500"
                      }`}
                      onClick={() => removeToast(toast.id)}
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Quản Lý Khóa Học
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý và theo dõi tất cả khóa học trong hệ thống
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2">
                <div className="text-sm text-slate-500">Tổng số</div>
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-xs text-slate-400">khóa học</div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm Khóa Học
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingCourse ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên Khóa Học *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập tên khóa học"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mã Khóa Học *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập mã khóa học"
                    readOnly={!!editingCourse}
                  />
                  {editingCourse && (
                    <p className="text-xs text-slate-500 mt-2">
                      Mã khóa học không thể thay đổi
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="Nhập mô tả khóa học"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nhân Viên Phụ Trách *
                  </label>
                  <select
                    required
                    value={formData.staffCode}
                    onChange={(e) =>
                      setFormData({ ...formData, staffCode: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staff.map((s) => (
                      <option key={s.staffCode} value={s.staffCode}>
                        {s.fullName} ({s.staffCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ngày Bắt Đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ngày Kết Thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      // Clear validation error when user changes the date
                      if (validationErrors.endDate) {
                        setValidationErrors({ endDate: "" });
                      }
                    }}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      validationErrors.endDate
                        ? "border-red-300 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  />
                  {validationErrors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.endDate}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  {editingCourse ? "Cập Nhật Khóa Học" : "Tạo Khóa Học"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{courses.length}</span> khóa học
            {totalItems > itemsPerPage && (
              <span> (từ {startIndex} đến {endIndex} trong tổng số {totalItems})</span>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Trang {currentPage} / {totalPages}
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Danh Sách Khóa Học
              </h2>
              <button
                onClick={loadCourses}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm Mới
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-slate-300 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Không tìm thấy khóa học
                </h3>
                <p className="text-slate-500 mb-4">Chưa có khóa học nào trong hệ thống</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Tạo Khóa Học Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Course Info - Left Side */}
                      <div className="flex-1 space-y-4">
                        {/* Title and Basic Info */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-slate-900">
                                {course.courseName}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                                  Mã: {course.courseCode}
                                </span>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">
                                  👨 NV: {course.staffCode}
                                </span>
                              </div>
                            </div>

                            {/* Date Info */}
                            <div className="bg-slate-50 rounded-lg px-4 py-3 min-w-[200px]">
                              <div className="space-y-2 text-sm">
                                {course.startDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600">
                                      ▶
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      Bắt đầu: {new Date(course.startDate).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                )}
                                {course.endDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-600">
                                      ⏹
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      Kết thúc: {new Date(course.endDate).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {course.description && (
                          <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-slate-700 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Right Side */}
                      <div className="flex flex-row lg:flex-col xl:flex-row gap-3 lg:items-end">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium min-w-[120px]"
                        >
                          <span>✏️</span>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(course.courseCode)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium min-w-[120px]"
                        >
                          <span>🗑️</span>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination - Chỉ hiển thị khi có nhiều hơn 1 trang */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Hiển thị <span className="font-semibold">{startIndex}</span> -{" "}
                  <span className="font-semibold">{endIndex}</span> của{" "}
                  <span className="font-semibold">{totalItems}</span> kết quả
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
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
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>Sau</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        loading={confirmDialog.loading}
      />
    </div>
  );
};