import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { CertificatePdfActions } from "../certificates/CertificatePdfActions";

type Certificate = {
  id: number;
  certId: string;
  templateId: string;
  studentId: string;
  issued_at: string;
  expire_at?: string;
  status: string;
  serialNumber: string;
  pdfUri?: string;
  pdfSha256?: string;
};

type Student = {
  id: number;
  fullName: string;
  studentCode: string;
  xepLoai?: string;
};

export const CertificateListAdmin: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Map<string, Student>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filterStudentId, setFilterStudentId] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCertificates();
  }, [filterStudentId, currentPage]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      let url = `/api/certificates?page=${currentPage}&size=20`;
      if (filterStudentId) {
        url += `&studentId=${encodeURIComponent(filterStudentId)}`;
      }

      const res = await apiCall(url);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.content || []);
        setTotalPages(data.totalPages || 0);

        // Load student info for certificates
        const studentIds = [
          ...new Set(
            (data.content || [])
              .map((c: Certificate) => c.studentId)
              .filter((id: any) => id)
          ),
        ];
        await loadStudents(studentIds as string[]);
      } else {
        setError("Failed to load certificates");
      }
    } catch (err) {
      setError("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (studentIds: string[]) => {
    const studentMap = new Map<string, Student>();
    try {
      const res = await apiCall("/api/users/students");
      if (res.ok) {
        const allStudents = await res.json();
        allStudents.forEach((student: any) => {
          if (
            studentIds.includes(student.studentCode) ||
            studentIds.includes(student.id?.toString())
          ) {
            studentMap.set(student.studentCode, student);
            studentMap.set(student.id?.toString(), student);
          }
        });
      }
    } catch (err) {
      console.warn("Could not load student info:", err);
    }
    setStudents(studentMap);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm mới
      loadCertificates();
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    setCurrentPage(0);
    loadCertificates();
  };
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REVOKED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Certificate Management
          </h1>
          <p className="text-gray-600">
            Admin panel for managing all certificates
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

        {/* Filters */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Filter by Student ID
              </label>
              <input
                type="text"
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter student ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                className="w-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setFilterStudentId("");
                  setCurrentPage(0);
                  loadCertificates(); 
                }}
                className="w-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Certificate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((cert) => {
                  return (
                    <tr key={cert.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            {cert.serialNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {cert.certId}
                          </div>
                          <div className="text-sm text-gray-600">
                            Template: {cert.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            {cert.studentId || "Loadin.."}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm rounded-full px-2 py-1 border ${getStatusColor(
                            cert.status
                          )} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                        >
                          <div>ISSUED</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          Issued:{" "}
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </div>
                        {cert.expire_at && (
                          <div>
                            Expires:{" "}
                            {new Date(cert.expire_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <CertificatePdfActions
                            certId={cert.certId}
                            studentCode={cert.studentId}
                            className="w-full"
                            viewButtonText="Xem PDF"
                            buttonSize="sm"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {certificates.length === 0 && !loading && (
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
                No certificates found
              </h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your filters or create new certificates.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-blue-800">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
