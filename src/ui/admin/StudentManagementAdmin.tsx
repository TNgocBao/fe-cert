import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { useNavigate } from "react-router-dom";
import { getColorScheme } from "../../styles/colors";
import { Student } from "../../types/domain";

export const StudentManagementAdmin: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  // ADMIN color scheme
  const colors = getColorScheme("ADMIN");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    studentCode: "",
    fullName: "",
    xepLoai: "",
    email: "",
    majorName: "",
    className: "",
    gpa: "",
    startYear: "",
    passedEnglish: false,
    status: true,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await apiCall("/api/users/students");
      if (res.ok) {
        const data = await res.json();
        const processedData = (data || []).map((student: any) => ({
          ...student,
          fullName: student.fullName || "Chưa có tên",
          studentCode: student.studentCode,
          xepLoai: student.xepLoai || "Chưa xếp loại",
          email: student.email || "N/A",
          majorName: student.majorName || "N/A",
          className: student.className || "N/A",
          gpa: student.gpa || 0,
          startYear: student.startYear || "N/A",
          passedEnglish: student.passedEnglish || false,
          status: student.status !== undefined ? student.status : true,
        }));
        setStudents(processedData);
      } else {
        console.error("Failed to load students:", res.status, res.statusText);
        setError("Failed to load students");
      }
    } catch (err) {
      console.error("Error loading students:", err);
      setError("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || updating) return;
    
    setUpdating(true);
    const studentCodeToUpdate = encodeURIComponent(formData.studentCode);

    try {
      const updateData = {
        fullName: formData.fullName || "",
        xepLoai: formData.xepLoai || "",
        email: formData.email || "",
        majorName: formData.majorName || "",
        className: formData.className || "",
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        startYear: formData.startYear || "",
        passedEnglish: formData.passedEnglish,
        status: formData.status,
      };

      // console.log("Request data:", updateData);

      const res = await apiCall(`/api/users/student/${studentCodeToUpdate}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Update response status:", res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log("Update successful:", responseData);
        setEditingStudent(null);
        resetForm();
        loadStudents();
        setError("");
      } else {
        const errorText = await res.text();
        console.error("Failed to update student:", res.status, errorText);
        setError(`Failed to update student: ${errorText}`);
      }
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Error updating student");
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentCode: "",
      fullName: "",
      xepLoai: "",
      email: "",
      majorName: "",
      className: "",
      gpa: "",
      startYear: "",
      passedEnglish: false,
      status: true,
    });
    setEditingStudent(null);
  };

  const openEditModal = (student: Student) => {
    console.log("Opening modal for student:", student);
    setEditingStudent(student);
    setFormData({
      studentCode: student.studentCode || "",
      fullName: student.fullName || "",
      xepLoai: student.xepLoai || "",
      email: student.email || "",
      majorName: student.majorName || "",
      className: student.className || "",
      gpa: student.gpa?.toString() || "",
      startYear: student.startYear || "",
      passedEnglish: student.passedEnglish || false,
      status: student.status !== undefined ? student.status : true,
    });
  };

  const filteredStudents = students.filter((student) => {
    const name = student.fullName?.toLowerCase() || "";
    const code = student.studentCode?.toLowerCase() || "";
    const major = student.majorName?.toLowerCase() || "";
    const className = student.className?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      name.includes(search) ||
      code.includes(search) ||
      major.includes(search) ||
      className.includes(search)
    );
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
          Quản Lý Sinh Viên
        </h1>
        <p className="text-lg" style={{ color: colors.textLight }}>
          Xem và chỉnh sửa thông tin sinh viên chi tiết
        </p>
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

      {/* Actions Bar */}
      <div
        className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        style={{ borderColor: colors.border }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                boxShadow: `0 0 0 2px ${colors.accent}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
        style={{ borderColor: colors.border }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: colors.primary }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Mã SV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Họ Tên
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Ngành
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Lớp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  GPA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Năm Nhập Học
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Xếp Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text }}>
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" style={{ color: colors.text }}>
                    {student.studentCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.fullName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.majorName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.className}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.gpa}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.startYear}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    {student.xepLoai}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: colors.textLight }}>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === true
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status === true ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(student)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded transition-colors"
                      style={{
                        color: colors.accent,
                        backgroundColor: `${colors.primary}20`,
                        border: `1px solid ${colors.primary}`,
                      }}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div
              className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              <svg
                className="h-8 w-8"
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
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
              Không tìm thấy sinh viên
            </h3>
            <p className="text-sm" style={{ color: colors.textLight }}>
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác."
                : "Không có sinh viên nào."}
            </p>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-xl font-semibold" style={{ color: colors.text }}>
                Chỉnh Sửa Thông Tin Sinh Viên
              </h3>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Mã Sinh Viên
                  </label>
                  <input
                    type="text"
                    value={formData.studentCode}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    style={{ borderColor: colors.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Họ Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Ngành Học
                  </label>
                  <input
                    type="text"
                    value={formData.majorName}
                    onChange={(e) =>
                      setFormData({ ...formData, majorName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Lớp
                  </label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({ ...formData, className: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) =>
                      setFormData({ ...formData, gpa: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Năm Nhập Học
                  </label>
                  <input
                    type="text"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({ ...formData, startYear: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Xếp Loại
                  </label>
                  <select
                    value={formData.xepLoai}
                    onChange={(e) =>
                      setFormData({ ...formData, xepLoai: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      boxShadow: `0 0 0 2px ${colors.accent}`,
                    }}
                  >
                    <option value="">Chọn xếp loại</option>
                    <option value="Xuất sắc">Xuất sắc</option>
                    <option value="Giỏi">Giỏi</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Yếu">Yếu</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    checked={formData.status}
                    onChange={(e) => {
                      console.log('Status checkbox changed:', e.target.checked);
                      setFormData({
                        ...formData,
                        status: e.target.checked,
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="status"
                    className="ml-2 block text-sm"
                    style={{ color: colors.text }}
                  >
                    Trạng Thái Hoạt Động
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="passedEnglish"
                    checked={formData.passedEnglish}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passedEnglish: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="passedEnglish"
                    className="ml-2 block text-sm"
                    style={{ color: colors.text }}
                  >
                    Đã thi đậu tiếng Anh
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {updating ? 'Đang cập nhật...' : 'Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};