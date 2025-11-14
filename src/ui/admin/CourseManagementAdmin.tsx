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
  const [courses, setCourses] = useState<Course[]>([]);
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
        setCourses(responseData.data.content || []);
      }
    } catch (err) {
      console.error("Could not load courses:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");

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
        console.log(editingCourse.courseCode);
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
          addToast("success", "Success", "Course updated successfully!");
          loadCourses();
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
          addToast("success", "Success", "Course created successfully!");
          loadCourses();
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
      title: "Delete Course",
      message:
        "Are you sure you want to delete this course? This action cannot be undone.",
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
        addToast("success", "Success", "Course deleted successfully!");
        loadCourses();
      } else {
        setError("Failed to delete course");
        addToast("error", "Error", "Failed to delete course!");
      }
    } catch (err) {
      setError("Error deleting course");
      addToast("error", "Error", "Error deleting course!");
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
    setEditingCourse(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                Course Management
              </h1>
              <p className="text-gray-600">
                Admin panel for managing all courses
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Course
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
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

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter course code"
                    readOnly={!!editingCourse}
                  />
                  {editingCourse && (
                    <p className="text-xs text-gray-500 mt-1">
                      Course code cannot be changed
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter course description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Code *
                  </label>
                  <select
                    required
                    value={formData.staffCode}
                    onChange={(e) =>
                      setFormData({ ...formData, staffCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Staff</option>
                    {staff.map((s) => (
                      <option key={s.staffCode} value={s.staffCode}>
                        {s.fullName} ({s.staffCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCourse ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-blue-800">
              Courses ({courses.length})
            </h2>
            <button
              onClick={loadCourses}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-gray-500">No courses found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Course Info - Left Side */}
                    <div className="flex-1 space-y-4">
                      {/* Title and Basic Info */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">
                             Tên khóa học :  {course.courseName}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                                  Mã khóa học : {course.courseCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">
                                  👨Nhân viên phụ trách : {course.staffCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Date Info */}
                          <div className="bg-gray-50 rounded-lg px-4 py-3 min-w-[180px]">
                            <div className="space-y-1 text-sm">
                              {course.startDate && (
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">
                                    ▶Ngày bắt đầu:
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {new Date(
                                      course.startDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {course.endDate && (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600">
                                    ⏹Ngày kết thúc:
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {new Date(
                                      course.endDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {course.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">
                            Mô tả : {course.description}
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.courseCode)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium min-w-[120px]"
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={confirmDialog.loading}
      />
    </div>
  );
};
