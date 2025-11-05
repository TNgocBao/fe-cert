import React, { useState, ChangeEvent, FormEvent } from "react";
import { useApi } from "../api";

interface VerifyResult {
  signerName: string;
  reason: string;
  subjectDN: string;
  issuerDN: string;
  signDate: Date;
  signatureValid: boolean;
  coversWholeDocument: boolean;
  valid: boolean;
  chainLength: number;
  timeStampValid: boolean;
  message: string;
  publicKeyValid: boolean;
}

interface ApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: VerifyResult | null;
}

// Hàm extract tên người ký
const extractSignerName = (dnString: string): string => {
  if (!dnString) return "Không xác định";

  try {
    // Ưu tiên lấy từ CN (Common Name)
    const cnMatch = dnString.match(/CN=([^,]+)/);
    if (cnMatch && cnMatch[1]) {
      return cnMatch[1].trim();
    }

    // Sau đó lấy từ UID
    const uidMatch = dnString.match(/UID=([^,]+)/);
    if (uidMatch && uidMatch[1]) {
      return uidMatch[1].trim();
    }

    // Cuối cùng lấy từ email
    const emailMatch = dnString.match(/EMAILADDRESS=([^,]+)/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1].split("@")[0];
    }

    return "Không xác định";
  } catch (error) {
    console.error("Error extracting signer name:", error);
    return "Không xác định";
  }
};

const VerifyDiploma: React.FC = () => {
  const { apiCall } = useApi();
  const [studentCode, setStudentCode] = useState("");
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const handleStudentCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentCode(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDiplomaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!diplomaFile || !studentCode.trim()) {
      setMessage("Vui lòng nhập mã sinh viên và chọn file bằng cấp.");
      return;
    }

    setLoading(true);
    setMessage("");
    setVerifyResult(null);

    try {
      const formData = new FormData();
      formData.append("diplomaFile", diplomaFile);

      const response = await fetch(
        `/api/v1/requests/${studentCode.trim()}/verifydiploma`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        setMessage("✅ " + result.message);
        setVerifyResult(result.data);
      } else {
        setMessage("❌ " + result.message);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setMessage("❌ Lỗi: " + (err.message || "Không thể kết nối đến server"));
    } finally {
      setLoading(false);
    }
  };

  // Lấy tên người ký đã được xử lý
  const signerName = verifyResult
    ? extractSignerName(verifyResult.subjectDN) ||
      extractSignerName(verifyResult.issuerDN)
    : "";

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-2xl font-bold text-white text-center">
          Xác Minh Bằng Cấp
        </h2>
        <p className="text-blue-100 text-center text-sm mt-1">
          Kiểm tra tính xác thực của văn bằng chứng chỉ
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Code Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã Sinh Viên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentCode}
              onChange={handleStudentCodeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Nhập mã sinh viên..."
              required
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              File Bằng Cấp (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click để upload</span> hoặc
                    kéo thả file
                  </p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
            {diplomaFile && (
              <p className="mt-2 text-sm text-green-600">
                ✅ Đã chọn: {diplomaFile.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xác minh...
              </div>
            ) : (
              "Xác Minh Bằng Cấp"
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-center font-medium ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Verification Result */}
        {verifyResult && (
          <div className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              📋 Kết Quả Xác Minh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thông tin cơ bản */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Trạng Thái
                  </label>
                  <div
                    className={`text-lg font-bold ${
                      verifyResult.valid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {verifyResult.valid ? "✅ HỢP LỆ" : "❌ KHÔNG HỢP LỆ"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Người Ký
                  </label>
                  <div className="text-sm font-medium text-gray-800">
                    {signerName}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Lý Do Ký
                  </label>
                  <div className="text-sm text-gray-800">
                    {verifyResult.reason || "Không xác định"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Ngày Ký
                  </label>
                  <div className="text-sm text-gray-800">
                    {new Date(verifyResult.signDate).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>

              {/* Thông tin kỹ thuật */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`bg-white p-3 rounded-lg border ${
                      verifyResult.signatureValid
                        ? "border-green-200"
                        : "border-red-200"
                    }`}
                  >
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Chữ Ký
                    </label>
                    <div
                      className={`text-sm font-medium ${
                        verifyResult.signatureValid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {verifyResult.signatureValid
                        ? "✅ Hợp lệ"
                        : "❌ Không hợp lệ"}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Phạm Vi Ký
                  </label>
                  <div
                    className={`text-sm font-medium ${
                      verifyResult.coversWholeDocument
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {verifyResult.coversWholeDocument
                      ? "✅ Toàn bộ tài liệu"
                      : "⚠ Một phần tài liệu"}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông điệp */}
            {verifyResult.message && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <label className="text-xs font-semibold text-blue-700 uppercase">
                  Thông Điệp
                </label>
                <div className="text-sm text-blue-800 mt-1">
                  {verifyResult.message}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyDiploma;
