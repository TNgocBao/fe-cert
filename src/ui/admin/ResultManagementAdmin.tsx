import React, { useEffect, useState } from "react";
import { useApi } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Result = {
  id: number;
  studentCode: string;
  fullName?: string;
  courseCode: string;
  score?: number;
  grade?: string;
  semester?: string;
  timeStudied?: string;
};

type Student = {
  id: number;
  fullName: string;
  studentCode: string;
};

type Course = {
  id: number;
  courseName: string;
  courseCode: string;
};

export const ResultManagementAdmin: React.FC = () => {
  const { apiCall } = useApi();
  const [allResults, setAllResults] = useState<Result[]>([]); // Tất cả results
  const [results, setResults] = useState<Result[]>([]); // Results hiển thị trên trang hiện tại
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  
  // Phân trang FE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const totalItems = allResults.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [formData, setFormData] = useState({
    studentCode: "",
    courseCode: "",
    score: "",
    grade: "",
    semester: "",
    timeStudied: "",
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
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

  // Effect để cập nhật results hiển thị khi allResults hoặc currentPage thay đổi
  useEffect(() => {
    updateDisplayedResults();
  }, [allResults, currentPage]);

  const updateDisplayedResults = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResults = allResults.slice(startIndex, endIndex);
    setResults(currentResults);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStudents(),
        loadCourses(),
        loadResults(),
      ]);
    } catch (err) {
      setError("Failed to load initial data");
      addToast("error", "Error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  // GET ALL results - load toàn bộ dữ liệu một lần
  const loadResults = async () => {
    try {
      const response = await apiCall("http://localhost:8080/api/results");

      // Parse response JSON
      const data = await response.json();
      console.log("Results response:", data);

      if (data && data.success) {
        // Backend trả về Page<ResultDTO> nên cần lấy content
        const resultsData = data.data?.content || data.data || [];
        setAllResults(resultsData);
        setCurrentPage(1); // Reset về trang đầu khi tải dữ liệu mới
        console.log(resultsData);
      } else {
        const errorMsg = data?.message || "Failed to load results";
        setError(errorMsg);
        addToast("error", "Error", errorMsg);
      }
    } catch (err: any) {
      console.error("Error loading results:", err);
      const errorMessage = err?.message || "Error loading results";
      setError(errorMessage);
      addToast("error", "Error", errorMessage);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await apiCall("/api/users/students");
      const data = await response.json();

      if (data) {
        setStudents(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.warn("Could not load students:", err);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await apiCall("http://localhost:8080/courses");
      if (response.ok) {
        const responseData = await response.json();
        console.log('Courses response:', responseData);
        
        // Transform data để đảm bảo có courseCode và courseName
        const coursesData = responseData.data?.content || responseData.data || [];
        const transformedCourses = coursesData.map((course: any) => ({
          id: course.id,
          courseCode: course.courseCode,
          courseName: course.courseName
        }));
        
        setCourses(transformedCourses);
        console.log('Loaded courses:', transformedCourses);
      }
    } catch (err) {
      console.error("Could not load courses:", err);
    }
  };

  const getCourseName = (courseCode: string) => {
    if (!courseCode) return 'Unknown Course';
    
    const course = courses.find(c => c.courseCode === courseCode);
    console.log(`Looking for course ${courseCode}, found:`, course);
    
    return course ? course.courseName : courseCode;
  };

  // CREATE result
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");

      // Validate required fields
      if (!formData.studentCode || !formData.courseCode) {
        setError("Student and Course are required fields");
        addToast("error", "Error", "Student and Course are required");
        return;
      }

      const payload = {
        studentCode: formData.studentCode,
        courseCode: formData.courseCode,
        score: formData.score ? parseFloat(formData.score) : null,
        grade: formData.grade || null,
        semester: formData.semester || null,
        timeStudied: formData.timeStudied || null,
      };

      console.log("Creating result with payload:", payload);

      const response = await apiCall(
        "http://localhost:8080/api/results/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Parse response
      const data = await response.json();
      console.log("Create result response:", data);

      if (data && data.success) {
        resetForm();
        setShowForm(false);
        addToast("success", "Success", "Result created successfully!");

        // Reload results to show the new one
        await loadResults();
      } else {
        const errorMsg = data?.message || "Failed to create result";
        setError(errorMsg);
        addToast("error", "Error", errorMsg);
      }
    } catch (err: any) {
      console.error("Error creating result:", err);
      const errorMessage = err?.message || "Error creating result";
      setError(errorMessage);
      addToast("error", "Error", errorMessage);
    }
  };

  const handleCreateNew = () => {
    setShowForm(true);
    addToast("info", "Info", "Creating new result");
  };

  const resetForm = () => {
    setFormData({
      studentCode: "",
      courseCode: "",
      score: "",
      grade: "",
      semester: "",
      timeStudied: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const getStudentName = (studentCode: string) => {
    const student = students.find((s) => s.studentCode === studentCode);
    return student ? student.fullName : studentCode;
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case "A":
      case "A+":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "B":
      case "B+":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "C":
      case "C+":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "D":
      case "D+":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "F":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-emerald-600 font-bold";
    if (score >= 7.0) return "text-blue-600 font-bold";
    if (score >= 5.5) return "text-amber-600 font-bold";
    if (score >= 4.0) return "text-orange-600 font-bold";
    return "text-rose-600 font-bold";
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

  if (loading && allResults.length === 0) {
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
                Quản Lý Kết Quả Học Tập
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý và theo dõi kết quả học tập của sinh viên
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2">
                <div className="text-sm text-slate-500">Tổng số</div>
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-xs text-slate-400">kết quả</div>
              </div>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm Kết Quả
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

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Thêm Kết Quả Mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sinh Viên *
                  </label>
                  <select
                    required
                    value={formData.studentCode}
                    onChange={(e) =>
                      setFormData({ ...formData, studentCode: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Chọn sinh viên</option>
                    {students.map((student) => (
                      <option
                        key={student.studentCode}
                        value={student.studentCode}
                      >
                        {student.fullName} ({student.studentCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Khóa Học *
                  </label>
                  <select
                    required
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Chọn khóa học</option>
                    {courses.map((course) => (
                      <option key={course.courseCode} value={course.courseCode}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00 - 10.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Xếp loại
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Chọn xếp loại</option>
                    <option value="A+">A+ (Xuất sắc)</option>
                    <option value="A">A (Giỏi)</option>
                    <option value="B+">B+ (Khá giỏi)</option>
                    <option value="B">B (Khá)</option>
                    <option value="C+">C+ (Trung bình khá)</option>
                    <option value="C">C (Trung bình)</option>
                    <option value="D+">D+ (Trung bình yếu)</option>
                    <option value="D">D (Yếu)</option>
                    <option value="F">F (Kém)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Học kỳ
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: HK1 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Thời gian học (tháng)
                  </label>
                  <input
                    type="text"
                    value={formData.timeStudied}
                    onChange={(e) =>
                      setFormData({ ...formData, timeStudied: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 6 tháng"
                  />
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
                  Tạo Kết Quả
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{results.length}</span> kết quả
            {totalItems > itemsPerPage && (
              <span> (từ {startIndex} đến {endIndex} trong tổng số {totalItems})</span>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Trang {currentPage} / {totalPages}
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Danh Sách Kết Quả
              </h2>
              <button
                onClick={loadResults}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm Mới
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-slate-300 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Bắt đầu bằng cách tạo kết quả đầu tiên. Theo dõi điểm số và xếp loại của sinh viên cho từng khóa học.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  + Tạo Kết Quả Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-slate-900 text-lg">
                              {getStudentName(result.studentCode)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                🎓 {getCourseName(result.courseCode)}
                              </span>
                              <span className="text-sm text-slate-500">
                                Mã SV: {result.studentCode}
                              </span>
                              <span className="text-sm text-slate-500">
                                Mã Khóa Học : {result.courseCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {result.score !== null &&
                            result.score !== undefined && (
                              <div
                                className={`text-2xl ${getScoreColor(
                                  result.score
                                )}`}
                              >
                              {result.score.toFixed(2)}
                              </div>
                            )}

                          {result.grade && (
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-lg ${getGradeColor(
                                result.grade
                              )}`}
                            >
                              Xếp loại: {result.grade}
                            </span>
                          )}

                          {result.semester && (
                            <span className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                              📅 Năm học : {result.semester}
                            </span>
                          )}
                          {result.timeStudied && (
                            <span className="text-sm text-slate-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                              ⏱️Thời gian học : {result.timeStudied}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 mt-8 pt-6">
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
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="OK"
        cancelText="Cancel"
        type="info"
        loading={confirmDialog.loading}
      />
    </div>
  );
};