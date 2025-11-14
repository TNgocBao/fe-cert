// components/StudentResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';
import { getColorScheme } from '../../styles/colors';

type Result = {
  id: number;
  studentCode: string;
  courseCode: string;
  courseName: string;
  score: number;
  grade: string;
  semester: string;
  timeStudied?: string;
  xepLoai?: string;
  credit?: number;
  createdAt?: string;
};

export const StudentResultsPage: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const colors = getColorScheme('STUDENT');
  
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('courseName');

  useEffect(() => {
    loadAllResults();
  }, []);

  useEffect(() => {
    filterAndSortResults();
  }, [results, searchTerm, selectedSemester, selectedGrade, sortBy]);

  const loadAllResults = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiCall(`/api/results/student/${user?.studentCode}/courses`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
      } else {
        throw new Error('Không thể tải kết quả học tập');
      }
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Lỗi khi tải kết quả học tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortResults = () => {
    let filtered = [...results];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.courseName.toLowerCase().includes(term) ||
        result.courseCode.toLowerCase().includes(term) ||
        result.semester.toLowerCase().includes(term)
      );
    }

    // Lọc theo học kỳ
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(result => result.semester === selectedSemester);
    }

    // Lọc theo xếp loại
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(result => result.grade === selectedGrade);
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'courseName':
          return a.courseName.localeCompare(b.courseName);
        case 'courseCode':
          return a.courseCode.localeCompare(b.courseCode);
        case 'score':
          return b.score - a.score;
        case 'semester':
          return b.semester.localeCompare(a.semester);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
      case 'EXCELLENT':
      case 'XUẤT SẮC':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
      case 'GOOD':
      case 'GIỎI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
      case 'AVERAGE':
      case 'KHÁ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
      case 'POOR':
      case 'TRUNG BÌNH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
      case 'FAIL':
      case 'YẾU':
      case 'KÉM':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-blue-600';
    if (score >= 5.5) return 'text-yellow-600';
    if (score >= 4.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUniqueSemesters = () => {
    const semesters = results.map(result => result.semester);
    return [...new Set(semesters)].sort().reverse();
  };

  const getUniqueGrades = () => {
    const grades = results.map(result => result.grade);
    return [...new Set(grades)].sort();
  };

  const calculateStatistics = () => {
    const totalCourses = results.length;
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalCourses > 0 ? totalScore / totalCourses : 0;
    
    const gradeDistribution = results.reduce((acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCourses,
      averageScore: Number(averageScore.toFixed(2)),
      gradeDistribution
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
                Kết Quả Học Tập
              </h1>
              <p className="text-lg mt-2" style={{ color: colors.textLight }}>
                {user?.fullName || user?.name} - {user?.studentCode}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ 
                color: colors.accent, 
                backgroundColor: colors.primary,
                border: `1px solid ${colors.border}`
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại Home
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Tổng Số Khóa Học</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F0F9FF' }}>
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{ color: colors.textLight }}>Điểm Trung Bình</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{stats.averageScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8" style={{ borderColor: colors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên môn, mã môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: colors.border, 
                  boxShadow: `0 0 0 2px ${colors.accent}` 
                }}
              />
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Học kỳ
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: colors.border, 
                  boxShadow: `0 0 0 2px ${colors.accent}` 
                }}
              >
                <option value="all">Tất cả học kỳ</option>
                {getUniqueSemesters().map(semester => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Xếp loại
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: colors.border, 
                  boxShadow: `0 0 0 2px ${colors.accent}` 
                }}
              >
                <option value="all">Tất cả xếp loại</option>
                {getUniqueGrades().map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: colors.border, 
                  boxShadow: `0 0 0 2px ${colors.accent}` 
                }}
              >
                <option value="courseName">Theo tên môn</option>
                <option value="courseCode">Theo mã môn</option>
                <option value="score">Theo điểm (cao-thấp)</option>
                <option value="semester">Theo học kỳ (mới-cũ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: colors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              Danh sách kết quả ({filteredResults.length} môn)
            </h2>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
                <svg className="h-8 w-8" style={{ color: colors.textLight }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                Không tìm thấy kết quả nào
              </h3>
              <p className="text-sm" style={{ color: colors.textLight }}>
                {searchTerm || selectedSemester !== 'all' || selectedGrade !== 'all' 
                  ? "Thử thay đổi điều kiện tìm kiếm." 
                  : "Chưa có kết quả học tập nào."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.border }}>
                    <th className="text-left py-4 px-6 font-semibold" style={{ color: colors.text }}>
                      Môn học
                    </th>
                    <th className="text-left py-4 px-6 font-semibold" style={{ color: colors.text }}>
                      Học kỳ
                    </th>
                    <th className="text-center py-4 px-6 font-semibold" style={{ color: colors.text }}>
                      Điểm số
                    </th>
                    <th className="text-center py-4 px-6 font-semibold" style={{ color: colors.text }}>
                      Xếp loại
                    </th>
                    <th className="text-center py-4 px-6 font-semibold" style={{ color: colors.text }}>
                      Thời gian học
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr 
                      key={result.id} 
                      className={`border-b transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      style={{ borderColor: colors.border }}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium" style={{ color: colors.text }}>
                            {result.courseName}
                          </p>
                          <p className="text-sm" style={{ color: colors.textLight }}>
                            {result.courseCode}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {result.semester}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center" style={{ color: colors.textLight }}>
                        {result.timeStudied || 'N/A'} Tháng
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with refresh button */}
          <div className="px-6 py-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex justify-between items-center">
              <p className="text-sm" style={{ color: colors.textLight }}>
                Hiển thị {filteredResults.length} kết quả
              </p>
              <button
                onClick={loadAllResults}
                disabled={loading}
                className="flex items-center px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                style={{ 
                  color: colors.accent, 
                  backgroundColor: colors.primary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Đang tải...' : 'Làm mới'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};