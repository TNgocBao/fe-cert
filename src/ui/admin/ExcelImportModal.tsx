import React, { useState, useRef } from "react";
import { useApi } from "../api";
import { getColorScheme } from "../../styles/colors";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  templateUrl?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  templateUrl,
}) => {
  const { apiCall } = useApi();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = getColorScheme("ADMIN");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Chỉ chấp nhận file Excel (.xls, .xlsx)");
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File không được vượt quá 10MB");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Sử dụng apiCall và xử lý Response
      const response = await apiCall("/api/users/import/students", {
        method: "POST",
        body: formData,
        // KHÔNG set Content-Type khi dùng FormData, browser sẽ tự set
      });

      console.log(response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || "Upload failed"}`
        );
      }

      // Parse JSON từ response
      const result = await response.json();
      console.log(result);
      if (result.success) {
        setUploadResult({
          success: true,
          message: result.message || "Import thành công!",
          data: result.data,
        });
      } else {
        setUploadResult({
          success: false,
          message: result.message || "Import thất bại",
          data: result.data,
        });
      }
    } catch (err: any) {
      console.error("Upload error:", err);

      // Xử lý các loại lỗi cụ thể
      if (err.message.includes("HTTP 404")) {
        setError("API endpoint không tồn tại. Vui lòng kiểm tra đường dẫn.");
      } else if (err.message.includes("HTTP 500")) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else if (err.message.includes("Session expired")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(err.message || "Có lỗi xảy ra khi upload file");
      }

      setUploadResult({
        success: false,
        message: err.message || "Import thất bại",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm mt-2" style={{ color: colors.textLight }}>
            {description}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Download */}
          {templateUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800">
                    File mẫu Excel
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Tải file mẫu để biết định dạng dữ liệu cần thiết
                  </p>
                  <a
                    href={templateUrl}
                    download
                    className="inline-flex items-center mt-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Tải file mẫu
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Chọn file Excel
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        Kéo thả file Excel vào đây hoặc click để chọn
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.textLight }}
                      >
                        Chỉ chấp nhận .xls, .xlsx (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
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

            {/* Upload Result */}
            {/* Upload Result */}
            {uploadResult && (
              <div
                className={`border rounded-lg p-4 ${
                  uploadResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {uploadResult.success ? (
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
                    ) : (
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
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4
                      className={`text-sm font-medium ${
                        uploadResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {uploadResult.success
                        ? "Import thành công!"
                        : "Import thất bại"}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        uploadResult.success ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {uploadResult.message}
                    </p>

                    {uploadResult.data && (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Thành công:</span>{" "}
                          {uploadResult.data.successCount || 0} bản ghi
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Lỗi:</span>{" "}
                          {uploadResult.data.errorCount || 0} bản ghi
                        </div>
                        {uploadResult.data.errorFilePath && (
                          <div className="text-sm">
                            <span className="font-medium">File lỗi:</span>
                            <a
                              href={`/api/users/download-import-errors?filePath=${encodeURIComponent(
                                uploadResult.data.errorFilePath
                              )}`}
                              className="text-blue-600 hover:text-blue-800 underline ml-2"
                              download="error_details.xlsx"
                            >
                              Tải xuống để xem chi tiết lỗi
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Excel Format Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Định dạng file Excel
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Cột A:</strong> Mã sinh viên *
              </p>
              <p>
                <strong>Cột B:</strong> Họ tên *
              </p>
              <p>
                <strong>Cột C:</strong> Ngày sinh (YYYY-MM-DD)
              </p>
              <p>
                <strong>Cột D:</strong> Email
              </p>
              <p>
                <strong>Cột E:</strong> Số điện thoại
              </p>
  
              <p>
                <strong>Cột G:</strong> Ngành học
              </p>
              <p>
                <strong>Cột H:</strong> Lớp
              </p>
              <p>
                <strong>Cột I:</strong> GPA
              </p>
              <p>
                <strong>Cột J:</strong> Năm nhập học
              </p>
              <p>
                <strong>Cột K:</strong> Xếp loại
              </p>
              <p>
                <strong>Cột L:</strong> Đã thi đậu tiếng Anh (1/0 hoặc
                true/false)
              </p>
              <p>
                <strong>Cột M:</strong> Trạng thái
              </p>
              <p className="text-gray-500 mt-2">* Bắt buộc nhập</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t bg-gray-50 rounded-b-xl"
          style={{ borderColor: colors.border }}
        >
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>

            {uploadResult?.success ? (
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 text-white rounded-lg transition-colors font-medium"
                style={{ backgroundColor: colors.accent }}
              >
                Đóng
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.accent }}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  "Upload & Import"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
