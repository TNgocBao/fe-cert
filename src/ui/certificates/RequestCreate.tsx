import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { useNavigate } from "react-router-dom";

export const RequestCreate: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  // Redirect non-students away from this page
  React.useEffect(() => {
    if (user && user.role !== "STUDENT") {
      navigate("/certificates/requests");
    }
  }, [user, navigate]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [form, setForm] = useState({
    requestType: "NEW_CERTIFICATE",
    reason: "",
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);

      console.log("Template loading skipped - using default template");
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {
        templateId: "11111111", // Default template
        requestCode: `REQ_${Date.now()}`,
        type: form.requestType,
        status: "PENDING",
        studentId: user?.studentCode, // Use studentCode as studentId since that's how the backend expects it
      };

      const res = await apiCall(
        `/api/v1/requests/${user?.studentCode}/signrequest`,
        {
          method: "POST",
          body: JSON.stringify({
            templateId: requestData.templateId,
            type: requestData.type,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSuccess("Yêu cầu chứng chỉ đã được gửi thành công!");
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          navigate("/certificates/requests/my");
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to submit request");
      }
    } catch (err) {
      setError("Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/certificates/requests/my")}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Xem Yêu cầu của tôi
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Yêu Cầu Chứng Chỉ Mới
          </h1>
          <p className="text-gray-600 text-lg">
            Gửi yêu cầu cấp chứng chỉ của bạn một cách nhanh chóng và dễ dàng
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
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

        {/* Error Message */}
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại Yêu Cầu *
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="requestType"
                    value="NEW_CERTIFICATE"
                    checked={form.requestType === "NEW_CERTIFICATE"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        requestType: e.target.value,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full peer-checked:block hidden"></div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Chứng Chỉ Mới
                        </div>
                        <div className="text-sm text-gray-500">
                          Yêu cầu cấp chứng chỉ tốt nghiệp lần đầu
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="requestType"
                    value="RENEWAL"
                    checked={form.requestType === "RENEWAL"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        requestType: e.target.value,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full peer-checked:block hidden"></div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Gia Hạn Chứng Chỉ
                        </div>
                        <div className="text-sm text-gray-500">
                          Gia hạn chứng chỉ đã hết hạn
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="requestType"
                    value="REPLACEMENT"
                    checked={form.requestType === "REPLACEMENT"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        requestType: e.target.value,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all">
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 peer-checked:border-purple-500 peer-checked:bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full peer-checked:block hidden"></div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Thay Thế Chứng Chỉ
                        </div>
                        <div className="text-sm text-gray-500">
                          Cấp lại chứng chỉ bị mất hoặc hỏng
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Student Info Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-3">
                Thông Tin Sinh Viên
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="ml-2 font-medium">
                    {user?.fullName || user?.name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mã SV:</span>
                  <span className="ml-2 font-medium">
                    {user?.studentCode || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Xếp loại:</span>
                  <span className="ml-2 font-medium">
                    {user?.xepLoai || "N/A"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Thông tin này sẽ được tự động điền vào chứng chỉ khi được duyệt.
              </p>
            </div>

            {/* Reason - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý Do Yêu Cầu (Tùy Chọn)
              </label>
              <textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nếu có lý do đặc biệt, vui lòng mô tả..."
              />
            </div>

            {/* Certificate Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">
                    Chứng Chỉ Sẽ Được Tạo
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên sinh viên:</span>
                        <span className="font-medium text-purple-700">
                          {user?.fullName || user?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã sinh viên:</span>
                        <span className="font-medium text-purple-700">
                          {user?.studentCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loại chứng chỉ:</span>
                        <span className="font-medium text-purple-700">
                          {form.requestType === "NEW_CERTIFICATE"
                            ? "Chứng Chỉ Mới"
                            : form.requestType === "RENEWAL"
                            ? "Gia Hạn"
                            : "Thay Thế"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày cấp dự kiến:</span>
                        <span className="font-medium text-purple-700">
                          {new Date().toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-purple-600 mt-3">
                    Chứng chỉ sẽ được tạo tự động với thông tin của bạn sau khi
                    được duyệt.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/certificates/requests/my")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Xem Yêu Cầu Của Tôi
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover-lift shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang Gửi Yêu Cầu...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Gửi Yêu Cầu Chứng Chỉ
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
