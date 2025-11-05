import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useApi } from "../api";
import { CertificatePdfActions } from "./CertificatePdfActions";

type Certificate = {
  id: string;
  certId: string;
  templateId: string;
  studentId: string;
  issuedAt: string;
  expireAt?: string;
  status: string;
  serialNo: string;
  certificate: string;
  studentCode: string;
  pdfUri?: string;
  pdfSha256?: string;
};

type Student = {
  id: string;
  name: string;
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
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTemplate, setFilterTemplate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, [filterStatus, filterTemplate, currentPage]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      let url = `/api/certificates?page=${currentPage}&size=20`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterTemplate) url += `&templateId=${filterTemplate}`;

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
    for (const id of studentIds) {
      try {
        const res = await apiCall(`/api/students/${id}`);
        if (res.ok) {
          const student = await res.json();
          studentMap.set(id, student);
        }
      } catch (err) {
        // Ignore individual student load errors
      }
    }
    setStudents(studentMap);
  };

  const updateStatus = async (certificateId: string, newStatus: string) => {
    try {
      setUpdatingStatus(certificateId);
      const res = await apiCall(`/api/certificates/${certificateId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (res.ok) {
        // Update local state
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certificateId ? { ...cert, status: newStatus } : cert
          )
        );
      } else {
        setError("Failed to update certificate status");
      }
    } catch (err) {
      setError("Error updating certificate status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteCertificate = async (certificateId: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      const res = await apiCall(`/api/${certificateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCertificates((prev) =>
          prev.filter((cert) => cert.id !== certificateId)
        );
      } else {
        setError("Failed to delete certificate");
      }
    } catch (err) {
      setError("Error deleting certificate");
    }
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

  const getStudentInfo = (studentId: string) => {
    return students.get(studentId);
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
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Template Filter
              </label>
              <input
                type="text"
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
                placeholder="Enter template ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus("");
                  setFilterTemplate("");
                  setCurrentPage(0);
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
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
                  const student = getStudentInfo(cert.studentId);
                  return (
                    <tr key={cert.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            {cert.serialNo}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {cert.certId || cert.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            Template: {cert.templateId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            {student ? student.name : "Loading..."}
                          </div>
                          <div className="text-sm text-gray-600">
                            {student ? student.studentCode : cert.studentId}
                          </div>
                          {student?.xepLoai && (
                            <div className="text-sm text-gray-600">
                              Grade: {student.xepLoai}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={cert.status}
                          onChange={(e) =>
                            updateStatus(cert.id, e.target.value)
                          }
                          disabled={updatingStatus === cert.id}
                          className={`text-sm rounded-full px-2 py-1 border ${getStatusColor(
                            cert.status
                          )} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="REVOKED">Revoked</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        </div>
                        {cert.expireAt && (
                          <div>
                            Expires:{" "}
                            {new Date(cert.expireAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <CertificatePdfActions
                            certId={cert.certId}
                            studentCode={cert.studentCode}
                            className="w-full"
                            viewButtonText="Xem PDF"
                            buttonSize="sm"
                          />
                          <button
                            onClick={() => deleteCertificate(cert.id)}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            Delete
                          </button>
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
