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
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
  }, [currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStudents(),
        loadCourses(),
        loadResults(currentPage),
      ]);
    } catch (err) {
      setError("Failed to load initial data");
      addToast("error", "Error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  // GET ALL results
  const loadResults = async (page: number = 0) => {
    try {
      const response = await apiCall("http://localhost:8080/api/results");

      // Parse response JSON
      const data = await response.json();
      console.log("Results response:", data);

      if (data && data.success) {
        // Backend trả về Page<ResultDTO> nên cần lấy content
        const resultsData = data.data?.content || data.data || [];
        setResults(resultsData);
        console.log(resultsData);
        // Set pagination info
        if (data.data) {
          setTotalPages(data.data.totalPages || 0);
        }

        addToast("success", "Success", `Loaded ${resultsData.length} results`);
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
        await loadResults(currentPage);
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
        return "bg-green-100 text-green-800 border border-green-200";
      case "B":
      case "B+":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "C":
      case "C+":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "D":
      case "D+":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "F":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600";
    if (score >= 7.0) return "text-blue-600";
    if (score >= 5.5) return "text-yellow-600";
    if (score >= 4.0) return "text-orange-600";
    return "text-red-600";
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 mb-2">
                Result Management
              </h1>
              <p className="text-gray-600">
                Admin panel for managing all student results
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              + Add New Result
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mb-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-6">
              Create New Result
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student *
                  </label>
                  <select
                    required
                    value={formData.studentCode}
                    onChange={(e) =>
                      setFormData({ ...formData, studentCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Student</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    required
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.courseCode} value={course.courseCode}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00 - 10.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+ (Excellent)</option>
                    <option value="A">A (Very Good)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Above Average)</option>
                    <option value="C+">C+ (Average)</option>
                    <option value="C">C (Below Average)</option>
                    <option value="D+">D+ (Poor)</option>
                    <option value="D">D (Very Poor)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Fall 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TimeStudied
                  </label>
                  <input
                    type="text"
                    value={formData.timeStudied}
                    onChange={(e) =>
                      setFormData({ ...formData, timeStudied: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. 6 months"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Create Result
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-purple-800">
                Results ({results.length})
              </h2>
              <button
                onClick={() => loadResults(currentPage)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start by creating your first result record. Track student
                  performance and grades for each course.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  + Create Your First Result
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {getStudentName(result.studentCode)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                🎓Tên khóa học : {getCourseName(result.courseCode)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Student: {result.studentCode}
                              </span>
                              <span className="text-sm text-gray-500">
                                Mã khóa học : {result.courseCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {result.score !== null &&
                            result.score !== undefined && (
                              <div
                                className={`text-2xl font-bold ${getScoreColor(
                                  result.score
                                )}`}
                              >
                                {result.score.toFixed(2)}
                              </div>
                            )}

                          {result.grade && (
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(
                                result.grade
                              )}`}
                            >
                              Grade: {result.grade}
                            </span>
                          )}

                          {result.semester && (
                            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              📅 Kì học : {result.semester}
                            </span>
                          )}
                          {result.timeStudied && (
                            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                             Thời gian học (tháng) : {result.timeStudied}
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
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition-colors"
                >
                  Next →
                </button>
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
