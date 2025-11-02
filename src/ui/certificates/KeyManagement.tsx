import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";

interface StaffOption {
  code: string;
  name: string;
  position: string;
}

export const KeyManagement: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();

  const [staffCode, setStaffCode] = useState("");
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStaffCodes();
  }, []);

  const fetchStaffCodes = async () => {
    try {
      const res = await apiCall("/api/keys/staff-codes");
      if (res.ok) {
        const staffList: StaffOption[] = await res.json();
        setStaffOptions(staffList);
      } else {
        console.error("Failed to fetch staff codes");
      }
    } catch (err) {
      console.error("Error fetching staff codes:", err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const generateAndDownloadP12 = async () => {
    if (!staffCode.trim()) {
      setError("Please enter a staff code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    const cleanCode = staffCode.trim().toUpperCase();

    try {
      // ✅ Gọi API bằng useApi
      const res = await apiCall(`/api/keys/generate/${cleanCode}`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to generate .p12 file");
      }

      // ✅ Lấy file blob từ response
      const blob = await res.blob();

      // ✅ Tạo URL tạm và tải file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cleanCode}.p12`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Generated and downloaded .p12 for staff ${cleanCode} successfully`);
      setStaffCode("");
    } catch (err: any) {
      console.error("❌ Error generating .p12:", err);
      setError(err.message || "Error generating .p12 file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
          Generate & Download .p12 Certificate
        </h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-center">{success}</p>}

        {loadingStaff ? (
          <div className="mb-4 text-center text-gray-600">Loading staff list...</div>
        ) : (
          <select
            value={staffCode}
            onChange={(e) => setStaffCode(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="">Select a staff member</option>
            {staffOptions.map((staff) => (
              <option key={staff.code} value={staff.code}>
                {staff.code} - {staff.name} ({staff.position})
              </option>
            ))}
          </select>
        )}

        <button
          onClick={generateAndDownloadP12}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors"
        >
          {loading ? "Generating..." : "Generate & Download .p12"}
        </button>
      </div>
    </div>
  );
};
