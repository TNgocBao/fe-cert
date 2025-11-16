import React, { useEffect, useState } from "react";
import { useApi } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Template = {
  id: string;
  name: string;
  description?: string;
  type: string;
  filePath?: string;
};

export const TemplateManagementAdmin: React.FC = () => {
  const { apiCall } = useApi();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    type: "",
    filePath: "",
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    templateId?: string;
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    templateId: "",
    loading: false,
  });

  // Toast notification system
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info" | "warning";
      title: string;
      message: string;
    }>
  >([]);

  // Toast notification functions
  const addToast = (
    type: "success" | "error" | "info" | "warning",
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
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiCall(`/api/templates`);

      // Parse response để lấy data
      const data = await response.json();
      console.log("API Response data:", data); 

      // Kiểm tra response structure
      if (data && data.success) {
        setTemplates(data.data || []);
        if (data.data && data.data.length === 0) {
          addToast("info", "Info", "No templates found");
        }
      } else {
        setTemplates([]);
        const errorMsg = data?.message || "No templates found";
        setError(errorMsg);
        addToast("warning", "Warning", errorMsg);
      }
    } catch (err: any) {
      console.error("Error loading templates:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load templates";

      setError(errorMessage);
      setTemplates([]);
      addToast("error", "Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setError("");

    // Validate form data
    if (!formData.id || !formData.name || !formData.type) {
      setError("Please fill in all required fields");
      addToast("error", "Error", "Please fill in all required fields");
      return;
    }

    // Sửa lại cách tạo FormData
    const formDataToSend = new FormData();

    // Thêm template data như form data thông thường, không phải JSON
    formDataToSend.append("id", formData.id);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("filePath", formData.filePath);

    if (selectedFile) {
      formDataToSend.append("file", selectedFile);
    }

    console.log("Sending form data:", Object.fromEntries(formDataToSend));

    const response = await apiCall("/api/templates/add-template", {
      method: "POST",
      body: formDataToSend,
      // KHÔNG set Content-Type header, browser sẽ tự set với boundary
    });

    const data = await response.json();
    console.log("Create template response:", data);

    if (data && data.success) {
      console.log("Template created successfully:", data);
      setTemplates((prev) => [...prev, data.data]);
      resetForm();
      setShowForm(false);
      addToast("success", "Success", "Template added successfully!");
    } else {
      const errorMsg = data?.message || "Failed to add template";
      setError(errorMsg);
      addToast("error", "Error", errorMsg);
    }
  } catch (err: any) {
    console.error("Error adding template:", err);
    const errorMessage = err?.response?.data?.message || err?.message || "Error adding template";
    setError(errorMessage);
    addToast("error", "Error", errorMessage);
  }
};


  const handleDelete = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Template",
      message: `Are you sure you want to delete template "${template?.name}"? This action cannot be undone.`,
      templateId: templateId,
      loading: false,
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.templateId) return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));

      const response = await apiCall(
        `/api/templates/${confirmDialog.templateId}/delete`,
        {
          method: "DELETE",
        }
      );

      // Parse response
      const data = await response.json();

      if (data && data.success) {
        // Remove template from local state
        setTemplates((prev) =>
          prev.filter((t) => t.id !== confirmDialog.templateId)
        );
        addToast("success", "Success", "Template deleted successfully!");
      } else {
        const errorMsg = data?.message || "Failed to delete template";
        setError(errorMsg);
        addToast("error", "Error", errorMsg);
      }
    } catch (err: any) {
      console.error("Error deleting template:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Error deleting template";

      setError(errorMessage);
      addToast("error", "Error", errorMessage);
    } finally {
      setConfirmDialog({
        isOpen: false,
        title: "",
        message: "",
        templateId: "",
        loading: false,
      });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      templateId: "",
      loading: false,
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      type: "",
      filePath: "",
    });
    setSelectedFile(null);
    setEditingTemplate(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const generateTemplateId = () => {
    const id = `TPL${Date.now()}`;
    setFormData({ ...formData, id });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "CERTIFICATE":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "DIPLOMA":
        return "bg-green-100 text-green-800 border border-green-200";
      case "TRANSCRIPT":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "OTHER":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
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
                  : toast.type === "warning"
                  ? "bg-yellow-50 border-yellow-200"
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
                    {toast.type === "warning" && (
                      <svg
                        className="h-6 w-6 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
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
                          : toast.type === "warning"
                          ? "text-yellow-800"
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
                          : toast.type === "warning"
                          ? "text-yellow-700"
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
                          : toast.type === "warning"
                          ? "text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Template Management
              </h1>
              <p className="text-gray-600">
                Admin panel for managing all certificate templates
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Add New Template
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-6">
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template ID *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter template ID"
                      disabled={!!editingTemplate}
                    />
                    {!editingTemplate && (
                      <button
                        type="button"
                        onClick={generateTemplateId}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter template description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="CERTIFICATE">Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.ppt,.pptx"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      📎 Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  {editingTemplate ? "Update Template" : "Add Template"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-green-800">
                Templates ({templates.length})
              </h2>
              <button
                onClick={loadTemplates}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by creating your first template. Templates help
                  you manage different certificate designs and formats.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  + Add Your First Template
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {template.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                ID: {template.id}
                              </span>
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(
                                  template.type
                                )}`}
                              >
                               Type : {template.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {template.description && (
                          <p className="text-gray-600 leading-relaxed">
                          Mô tả :  {template.description}
                          </p>
                        )}

                        {template.filePath && (
                          <div className="flex items-center text-sm text-blue-600">
                            <span className="mr-2">📎</span>
                            <span className="font-medium">File:</span>
                            <span className="ml-1">{template.filePath}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col xl:flex-row gap-2 lg:items-end">
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
