import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { useNavigate } from "react-router-dom";
import { getColorScheme } from "../../styles/colors";
import { Student } from "../../types/domain";

interface SignCertRequest {
  p12File: File | null;
  templateId: string;
  staffCode: string;
  alias: string;
  keystorePass: string;
  courseCode: string; // Course code ở root level
  students: Array<{
    studentCode: string;
    name: string;
    dob?: string;
    majorName?: string;
    timeStudied?: string;
    xepLoai?: string;
  }>;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

interface StudentWithResult extends Student {
  score?: number;
  grade?: string;
  semester?: string;
  timeStudied?: string;
}

export const CertificateSignFormStaff: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const colors = getColorScheme("STAFF");

  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentsInCourse, setStudentsInCourse] = useState<StudentWithResult[]>(
    []
  );
  const [selectedStudents, setSelectedStudents] = useState<StudentWithResult[]>(
    []
  );
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [signing, setSigning] = useState(false);

  // Form data cho certificate signing
  const [formData, setFormData] = useState<SignCertRequest>({
    p12File: null,
    templateId: "CERT001",
    staffCode: user?.username || "",
    alias: user?.username || "",
    keystorePass: "",
    courseCode: "", // Course code ở root level
    students: [],
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCourses(), loadAllStudents()]);
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await apiCall("http://localhost:8080/courses");
      if (response.ok) {
        const responseData = await response.json();
        const coursesData =
          responseData.data?.content || responseData.data || [];
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }
    } catch (err) {
      console.error("Could not load courses:", err);
    }
  };

  const loadAllStudents = async () => {
    try {
      const res = await apiCall("/api/users/students");
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data || []);
      }
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };

  // Load students có result trong course được chọn
  const loadStudentsInCourse = async (courseCode: string) => {
    if (!courseCode) return;

    try {
      setLoadingStudents(true);
      const response = await apiCall(
        `http://localhost:8080/api/results/course/${courseCode}/students`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.success) {
          const studentsWithResults = data.data || [];

          // Kết hợp thông tin student từ allStudents với result data
          const enrichedStudents = studentsWithResults.map((result: any) => {
            const studentInfo = allStudents.find(
              (s) => s.studentCode === result.studentCode
            );
            return {
              ...studentInfo,
              ...result,
              id: studentInfo?.id || 0,
            };
          });

          setStudentsInCourse(enrichedStudents);
          setSelectedCourse(courseCode);

          // Update formData với courseCode
          setFormData((prev) => ({ ...prev, courseCode }));
        }
      }
    } catch (err) {
      console.error(`Error loading students for course ${courseCode}:`, err);
      setError("Không thể tải danh sách sinh viên của khóa học này");
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = studentsInCourse.filter((student) => {
    const name = student.fullName?.toLowerCase() || "";
    const code = student.studentCode?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || code.includes(search);
  });

  const toggleStudentSelection = (student: StudentWithResult) => {
    setSelectedStudents((prev) => {
      const isSelected = prev.some((s) => s.id === student.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    setStudentsInCourse([]);
    setSelectedStudents([]);
    setFormData((prev) => ({ ...prev, courseCode }));

    if (courseCode) {
      loadStudentsInCourse(courseCode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, p12File: e.target.files[0] });
    }
  };

  const handleInputChange = (field: keyof SignCertRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignCertificates = async () => {
    // Validate required fields
    if (selectedStudents.length === 0) {
      setError("Vui lòng chọn ít nhất một sinh viên");
      return;
    }

    if (!formData.courseCode) {
      setError("Vui lòng chọn khóa học");
      return;
    }

    if (!formData.p12File) {
      setError("Vui lòng chọn file P12");
      return;
    }

    if (!formData.keystorePass) {
      setError("Vui lòng nhập keystore password");
      return;
    }

    if (!formData.alias) {
      setError("Vui lòng nhập alias");
      return;
    }

    try {
      setSigning(true);
      setError("");
      setSuccess("");

      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("p12File", formData.p12File);
      formDataToSend.append("templateId", formData.templateId);
      formDataToSend.append("staffCode", formData.staffCode);
      formDataToSend.append("alias", formData.alias);
      formDataToSend.append("keystorePass", formData.keystorePass);
      formDataToSend.append("courseCode", formData.courseCode);

      // Prepare students data
      const studentsForBackend = selectedStudents.map((student) => ({
        studentCode: student.studentCode,
        name: student.fullName,
        dob: student.dob || "",
        majorName: student.majorName || "",
        timeStudied: student.timeStudied || "",
        xepLoai: student.xepLoai || "",
      }));

      console.log("Course code:", formData.courseCode);
      console.log("Students data:", studentsForBackend);

      // Append students with proper indexing
      studentsForBackend.forEach((student, index) => {
        formDataToSend.append(
          `students[${index}].studentCode`,
          student.studentCode
        );
        formDataToSend.append(`students[${index}].name`, student.name);
        formDataToSend.append(`students[${index}].dob`, student.dob);
        formDataToSend.append(
          `students[${index}].majorName`,
          student.majorName
        );
        formDataToSend.append(
          `students[${index}].timeStudied`,
          student.timeStudied
        );
        formDataToSend.append(`students[${index}].xepLoai`, student.xepLoai);
      });

      // Debug FormData contents properly
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Send request
      const response = await fetch(
        "http://localhost:8080/api/v1/requests/sign-certificate",
        {
          method: "POST",
          body: formDataToSend,
          // Don't set Content-Type header - let browser set it with boundary
        }
      );

      console.log("Response status:", response.status);

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorMessage = `HTTP ${response.status}: `;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.message || errorData.error || errorText;
        } catch {
          errorMessage += errorText;
        }
        throw new Error(errorMessage);
      }

      // Success case
      const responseText = await response.text();
      console.log("Success response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: "Ký chứng chỉ thành công!" };
      }

      setSuccess(result.message || "Ký chứng chỉ thành công!");

      // Reset form
      resetForm();
    } catch (err: any) {
      console.error("Error signing certificates:", err);
      setError(err.message || "Lỗi khi ký chứng chỉ");
    } finally {
      setSigning(false);
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setSelectedStudents([]);
    setSelectedCourse("");
    setStudentsInCourse([]);
    setFormData({
      p12File: null,
      templateId: "CERT001", // Keep original template ID
      staffCode: user?.username || "",
      alias: user?.username || "",
      keystorePass: "",
      courseCode: "",
      students: [],
    });

    // Reset file input
    const fileInput = document.getElementById("p12File") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: colors.accent }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
          Ký Chứng Chỉ Cho Sinh Viên
        </h1>
        <p className="text-lg" style={{ color: colors.textLight }}>
          Chọn khóa học và sinh viên để ký chứng chỉ
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Signing Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Certificate Settings */}
        <div className="space-y-6">
          <div
            className="bg-white rounded-xl shadow-sm border p-6"
            style={{ borderColor: colors.border }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Thông Tin Ký Số
            </h2>
            <div className="space-y-4">
              {/* Course Selection */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Chọn Khóa Học *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* File upload */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  File Chứng Chỉ P12 *
                </label>
                <input
                  id="p12File"
                  type="file"
                  accept=".p12,.pfx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: colors.border }}
                  required
                />
                <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                  Chọn file chứng chỉ số định dạng P12/PFX
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Mẫu Chứng Chỉ *
                </label>
                <input
                  type="text"
                  value={formData.templateId}
                  onChange={(e) =>
                    handleInputChange("templateId", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Mã Nhân Viên *
                </label>
                <input
                  type="text"
                  value={formData.staffCode}
                  onChange={(e) =>
                    handleInputChange("staffCode", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Alias *
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => handleInputChange("alias", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                  required
                  placeholder="Nhập alias cho chứng chỉ"
                />
                <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                  Thường là tên hoặc mã định danh trong keystore
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Mật Khẩu Keystore *
                </label>
                <input
                  type="password"
                  value={formData.keystorePass}
                  onChange={(e) =>
                    handleInputChange("keystorePass", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                  required
                  placeholder="Nhập mật khẩu file P12"
                />
              </div>
            </div>
          </div>

          {/* Selected Students Summary */}
          {selectedStudents.length > 0 && (
            <div
              className="bg-white rounded-xl shadow-sm border p-6"
              style={{ borderColor: colors.accent }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: colors.text }}
              >
                Sinh Viên Đã Chọn ({selectedStudents.length})
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: colors.border }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {student.fullName}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.textLight }}
                      >
                        {student.studentCode} • {student.className}
                        {student.score && ` • Điểm: ${student.score}`}
                        {student.grade && ` • Xếp loại: ${student.grade}`}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStudentSelection(student)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Student Selection */}
        <div
          className="bg-white rounded-xl shadow-sm border p-6"
          style={{ borderColor: colors.border }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: colors.text }}
          >
            {selectedCourse
              ? `Sinh Viên Trong Khóa Học (${studentsInCourse.length})`
              : "Chọn Sinh Viên"}
          </h2>

          {!selectedCourse ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Vui lòng chọn khóa học trước</p>
            </div>
          ) : loadingStudents ? (
            <div className="flex items-center justify-center h-32">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: colors.accent }}
              ></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm sinh viên theo tên hoặc mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.accent}`,
                  }}
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.some(
                      (s) => s.id === student.id
                    );
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleStudentSelection(student)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected ? "ring-2" : "hover:bg-gray-50"
                        }`}
                        style={{
                          borderColor: colors.border,
                          backgroundColor: isSelected
                            ? colors.primary + "20"
                            : "white",
                          boxShadow: isSelected
                            ? `0 0 0 2px ${colors.accent}`
                            : "none",
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className="font-medium"
                              style={{ color: colors.text }}
                            >
                              {student.fullName}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: colors.primary,
                                  color: colors.accent,
                                }}
                              >
                                {student.studentCode}
                              </span>
                              <span className="text-xs text-gray-600">
                                {student.className}
                              </span>
                              {student.score && (
                                <span className="text-xs text-gray-600">
                                  Điểm: {student.score}
                                </span>
                              )}
                              {student.grade && (
                                <span className="text-xs text-gray-600">
                                  Xếp loại: {student.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <div
                      className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <svg
                        className="h-6 w-6"
                        style={{ color: colors.textLight }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-medium mb-1"
                      style={{ color: colors.text }}
                    >
                      Không tìm thấy sinh viên
                    </h3>
                    <p className="text-sm" style={{ color: colors.textLight }}>
                      {searchTerm
                        ? "Thử tìm kiếm với từ khóa khác."
                        : "Không có sinh viên nào trong khóa học này."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex justify-end space-x-4 pt-6 border-t"
        style={{ borderColor: colors.border }}
      >
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          style={{ borderColor: colors.border }}
        >
          Hủy
        </button>
        <button
          onClick={handleSignCertificates}
          disabled={
            selectedStudents.length === 0 ||
            !selectedCourse ||
            !formData.p12File ||
            !formData.keystorePass ||
            signing
          }
          className="px-6 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.accent }}
        >
          {signing ? "Đang ký..." : `Ký Chứng Chỉ (${selectedStudents.length})`}
        </button>
      </div>
    </div>
  );
};
