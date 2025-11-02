import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { useNavigate } from "react-router-dom";

type CertificateRequest = {
  id: string;
  studentId: string;
  templateId: string;
  requestType: string;
  status: string;
  reason?: string;
  adminNotes?: string;
  directorNotes?: string;
  approvedBy?: string;
  directorApprovedBy?: string;
  createdAt: string;
  reviewedAt?: string;
  directorReviewedAt?: string;
  completedAt?: string;
  serialNo?: string;
  certificateId?: string;
  studentName?: string;
  studentCode?: string;
  templateName?: string;
};

export const RequestListAdmin: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [signModal, setSignModal] = useState<{
    isOpen: boolean;
    request: CertificateRequest | null;
  }>({ isOpen: false, request: null });
  const [p12File, setP12File] = useState<File | null>(null);
  const [alias, setAlias] = useState("");
  const [keystorePass, setKeystorePass] = useState("");
  const [signing, setSigning] = useState(false);
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    request: CertificateRequest | null;
    action: "approve" | "reject" | null;
  }>({ isOpen: false, request: null, action: null });

  useEffect(() => {
    loadRequests();
  }, [filterStatus, currentPage]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      let url = `/api/certificate-requests?page=${currentPage}&size=20`;
      if (filterStatus) url += `&status=${filterStatus}`;

      // Nếu là sinh viên thì gọi endpoint riêng
      if (user?.role === "STUDENT") {
        url = "/api/certificate-requests/my";
      }

      console.log("📡 Loading requests from:", url, "| Role:", user?.role);

      const res = await apiCall(url);
      if (!res.ok) {
        console.error(
          "❌ Failed to load requests:",
          res.status,
          res.statusText
        );
        setError(`Failed to load requests: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log("✅ Received data:", data);

      // Nếu là sinh viên → backend trả array
      if (user?.role === "STUDENT") {
        setRequests(Array.isArray(data) ? data : []);
        setTotalPages(1);
      } else {
        // Admin / Staff → backend trả Page object
        setRequests(Array.isArray(data?.content) ? data.content : []);
        setTotalPages(data?.totalPages ?? 0);
      }

      setError("");
    } catch (err) {
      console.error("⚠️ Error loading requests:", err);
      setError("Error loading requests: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    requestId: string,
    action: "approve" | "reject",
    notes?: string | null
  ) => {
    try {
      setReviewingRequest(requestId);

      const reviewData = {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        staffId: user?.id || null,
      };

      const res = await apiCall(
        `/api/certificate-requests/${requestId}/status`,
        {
          method: "PUT",
          body: JSON.stringify(reviewData),
        }
      );

      if (res.ok) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: reviewData.status,
                  reviewedAt: new Date().toISOString(),
                }
              : req
          )
        );
        setReviewModal({ isOpen: false, request: null, action: null });
      } else {
        setError("Failed to review request");
      }
    } catch (err) {
      setError("Error reviewing request");
    } finally {
      setReviewingRequest(null);
    }
  };

  const handleSign = async () => {
    if (!signModal.request || !p12File) {
      setError("Vui lòng chọn file P12 và điền đầy đủ thông tin.");
      return;
    }

    setSigning(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("studentcode", signModal.request.studentCode || "");
      formData.append("staffcode", user?.id || "");
      formData.append("p12File", p12File);
      formData.append("alias", alias);
      formData.append("keystorepass", keystorePass);

      const res = await fetch("/api/v1/requests/sign", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess("Ký chứng chỉ thành công! File: " + data.signedFilePath);
        setSignModal({ isOpen: false, request: null });
        loadRequests();
      } else {
        const text = await res.text();
        setError("Ký chứng chỉ thất bại: " + text);
      }
    } catch (err) {
      setError("Lỗi khi ký chứng chỉ: " + (err as Error).message);
    } finally {
      setSigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "DIRECTOR_APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DIRECTOR_REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "NEW_CERTIFICATE":
        return "New Certificate";
      case "RENEWAL":
        return "Renewal";
      case "REPLACEMENT":
        return "Replacement";
      default:
        return type;
    }
  };

  const openReviewModal = (
    request: CertificateRequest,
    action: "approve" | "reject"
  ) => {
    setReviewModal({ isOpen: true, request, action });
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "STUDENT"
              ? "Yêu Cầu Chứng Chỉ Của Tôi"
              : "Quản Lý Yêu Cầu Chứng Chỉ"}
          </h1>
          <p className="text-gray-600">
            {user?.role === "STUDENT"
              ? "Xem danh sách yêu cầu chứng chỉ đã gửi"
              : "Xem xét và quản lý yêu cầu chứng chỉ từ sinh viên"}
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

        {/* Filters - Only show for admin/staff */}
        {user?.role !== "STUDENT" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc Theo Trạng Thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất Cả Trạng Thái</option>
                  <option value="PENDING">Chờ Duyệt</option>
                  <option value="APPROVED">Đã Duyệt</option>
                  <option value="REJECTED">Từ Chối</option>
                  <option value="COMPLETED">Hoàn Thành</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus("");
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yêu Cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sinh Viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Yêu Cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{String(request.id).slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.templateName || request.templateId}
                        </div>
                        {request.serialNo && (
                          <div className="text-sm text-gray-500 font-mono">
                            {request.serialNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.studentName || request.studentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.studentCode || request.studentId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getRequestTypeLabel(request.requestType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user?.role === "STAFF" &&
                          request.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  openReviewModal(request, "approve")
                                }
                                disabled={reviewingRequest === request.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 mr-2"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() =>
                                  openReviewModal(request, "reject")
                                }
                                disabled={reviewingRequest === request.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 mr-2"
                              >
                                Từ Chối
                              </button>
                            </>
                          )}
                        {user?.role === "STAFF" &&
                          request.status === "APPROVED" && (
                            <button
                              onClick={() =>
                                setSignModal({ isOpen: true, request })
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ký Chứng Chỉ
                            </button>
                          )}

                        {request.certificateId && (
                          <div className="flex space-x-2">
                            <a
                              href={`/certificates/${request.certificateId}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Xem Chứng Chỉ
                            </a>
                            <a
                              href={`/api/certificates/download/${request.certificateId}`}
                              download={`certificate_${
                                request.serialNo || request.certificateId
                              }.pdf`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Tải PDF
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Không tìm thấy yêu cầu nào
              </h3>
              <p className="mt-2 text-gray-500">
                {user?.role === "STUDENT"
                  ? "Bạn chưa gửi yêu cầu nào. Hãy tạo yêu cầu chứng chỉ mới."
                  : "Hãy thử điều chỉnh bộ lọc hoặc kiểm tra lại sau để có yêu cầu mới."}
              </p>
              {user?.role === "STUDENT" && (
                <button
                  onClick={() => navigate("/certificates/requests/create")}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo Yêu Cầu Mới
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination - Only show for admin/staff */}
        {user?.role !== "STUDENT" && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModal.isOpen && reviewModal.request && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {reviewModal.action === "approve" ? "Duyệt" : "Từ Chối"} Yêu
                  Cầu
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Sinh Viên:</strong>{" "}
                    {reviewModal.request.studentName ||
                      reviewModal.request.studentId}{" "}
                    (
                    {reviewModal.request.studentCode ||
                      reviewModal.request.studentId}
                    )
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Loại:</strong>{" "}
                    {getRequestTypeLabel(reviewModal.request.requestType)}
                  </p>
                  {reviewModal.request.reason && (
                    <p className="text-sm text-gray-600">
                      <strong>Lý do:</strong> {reviewModal.request.reason}
                    </p>
                  )}
                </div>
                {/* Admin notes removed for now */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      setReviewModal({
                        isOpen: false,
                        request: null,
                        action: null,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleReview(
                        reviewModal.request!.id,
                        reviewModal.action!,
                        null
                      );
                    }}
                    disabled={reviewingRequest === reviewModal.request.id}
                    className={`px-4 py-2 rounded-lg text-white ${
                      reviewModal.action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                  >
                    {reviewingRequest === reviewModal.request.id
                      ? "Đang xử lý..."
                      : reviewModal.action === "approve"
                      ? "Duyệt"
                      : "Từ Chối"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {signModal.isOpen && signModal.request && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-lg font-bold mb-4">Ký Chứng Chỉ</h2>
              <p className="mb-2">
                Sinh viên: {signModal.request.studentName} (
                {signModal.request.studentCode})
              </p>
              <div className="mb-2">
                <label className="block text-sm">File P12:</label>
                <input
                  type="file"
                  accept=".p12"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0])
                      setP12File(e.target.files[0]);
                  }}
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Alias:</label>
                <input
                  type="text"
                  className="border p-1 w-full"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">Keystore Password:</label>
                <input
                  type="password"
                  className="border p-1 w-full"
                  value={keystorePass}
                  onChange={(e) => setKeystorePass(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSignModal({ isOpen: false, request: null })}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSign}
                  disabled={signing}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {signing ? "Đang ký..." : "Ký"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
