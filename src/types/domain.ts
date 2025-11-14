// Domain Types - Chuẩn hóa dựa trên Backend Entity Structure

// Certificate Entity mapping
export interface Certificate {
  id: number;
  certId: string;
  templateId: string;
  studentId: string;
  issued_at: string;
  expire_at?: string;
  status: string;
  serial_no: string;
  userSignedId?: string; // user_sign_id
  pdf_uri?: string;
  pdf_sha256?: string;
}

// Student Entity mapping
export interface Student {
  id: number;
  username?: string;
  fullName: string;
  email?: string;
  phone?: string;
  studentCode: string;
  majorName?: string;
  className?: string;
  startYear?: string;
  gpa?: number;
  passedEnglish?: boolean;
  statusSV?: string;
  xepLoai?: string;
  status?: boolean;
  dob?: string;
  timeStudied?: string;
}

// Staff Entity mapping
export interface Staff {
  id: number;
  username?: string;
  fullName: string;
  email?: string;
  staffCode: string;
  name: string;
  position?: string;
  majorName?: string;
  status?: boolean;
}

// User Entity mapping
export interface User {
  id: number;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone?: string;
  dob?: string;
  status: boolean;
  departmentId?: number;
}

// Certificate Request Entity mapping
export interface CertificateRequest {
  id: number;
  templateId: string;
  requestType: string;
  status: string;
  reason?: string;
  adminNotes?: string;
  requestCode?: string;
  directorNotes?: string;
  approvedBy?: string;
  directorApprovedBy?: string;
  createdAt: string;
  reviewedAt?: string;
  directorReviewedAt?: string;
  completedAt?: string;
  serialNo?: string;
  certificateId?: string;
  studentRequestId?: string;
  studentName?: string;
  studentCode: string;
  studentId?: string;
  templateName?: string;
  // Thêm trường từ Certificate entity
  pdfUri?: string;
  pdfSha256?: string;
  certId?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

// Auth User object
export interface AuthUser {
  id: number;
  username: string;
  fullName?: string;
  name?: string;
  role: string;
  studentCode?: string;
  staffCode?: string;
  xepLoai?: string;
  email?: string;
  phone?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCertificates: number;
  totalStudents: number;
  totalStaff: number;
  totalUsers: number;
  expiringSoon: number;
  expired: number;
  issuedThisMonth: number;
}