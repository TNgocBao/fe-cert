import React from "react";
import { useNavigate } from "react-router-dom";

export const NewsAnnouncements: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img
                src="data:image/jpeg;base64,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"
                alt="KMA Logo"
                className="h-16 w-auto"
              />
              <div className="border-l border-gray-300 h-12"></div>
              <div>
                <h1 className="text-xl font-bold text-red-400 uppercase">
                  Hệ Thống Quản Lý Chứng Chỉ
                </h1>
                <p className="text-sm text-gray-600">
                  HỌC VIỆN KỸ THUẬT MẬT MÃ
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-yellow-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 py-3">
            <a href=" px-3 py-2 rounded font-medium">TRANG CHỦ</a>
            <a href=" px-3 py-2 rounded font-medium">GIỚI THIỆU</a>
            <a href=" px-3 py-2 rounded font-medium">ĐÀO TẠO</a>
            <a href=" px-3 py-2 rounded font-medium">TUYỂN SINH</a>
            <a href=" px-3 py-2 rounded font-medium">TIN TỨC</a>
            <a href=" px-3 py-2 rounded font-medium">LIÊN HỆ</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            {/* Featured News Slider */}
            <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
              <img src="https://actvn.edu.vn/News/GetImage/28237" alt="" />
            </div>

            {/* News Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Tin tức - Sự kiện */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="bg-red-800 text-white px-4 py-3 rounded-t-lg">
                  <h3 className="font-bold text-lg flex items-center">
                    <span className="mr-2">📢</span>
                    TIN TỨC - SỰ KIỆN
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-blue-800 hover:text-blue-600 cursor-pointer text-sm">
                        Lễ khai giảng năm học mới 2024-2025
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Sẽ được tổ chức vào ngày 15/09/2024 tại Hội trường
                        chính...
                      </p>
                      <span className="text-red-600 text-xs font-medium">
                        [05/09/2024]
                      </span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <h4 className="font-semibold text-blue-800 hover:text-blue-600 cursor-pointer text-sm">
                        Cuộc thi sinh viên nghiên cứu khoa học
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Đăng ký tham gia từ ngày 01/10/2024 đến 30/10/2024...
                      </p>
                      <span className="text-red-600 text-xs font-medium">
                        [01/09/2024]
                      </span>
                    </div>
                    <div className="pb-3">
                      <h4 className="font-semibold text-blue-800 hover:text-blue-600 cursor-pointer text-sm">
                        Thông báo lịch thi cuối kỳ
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Lịch thi học kỳ 1 năm học 2024-2025 sẽ được công bố...
                      </p>
                      <span className="text-red-600 text-xs font-medium">
                        [28/08/2024]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông báo */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="bg-red-800 text-white px-4 py-3 rounded-t-lg">
                  <h3 className="font-bold text-lg flex items-center">
                    <span className="mr-2">📋</span>
                    THÔNG BÁO
                  </h3>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">▶</span>
                      <span className="text-sm text-blue-800 hover:text-blue-600 cursor-pointer">
                        Thông báo về việc đăng ký học phần học kỳ 2
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">▶</span>
                      <span className="text-sm text-blue-800 hover:text-blue-600 cursor-pointer">
                        Lịch bảo vệ đồ án tốt nghiệp đợt 1/2024
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">▶</span>
                      <span className="text-sm text-blue-800 hover:text-blue-600 cursor-pointer">
                        Hướng dẫn sử dụng hệ thống quản lý chứng chỉ
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">▶</span>
                      <span className="text-sm text-blue-800 hover:text-blue-600 cursor-pointer">
                        Thông báo học bổng khuyến khích học tập
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses & Training */}
            <div className="bg-white rounded-lg shadow-md mb-8">
              <div className="bg-yellow-700 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-lg flex items-center">
                  <span className="mr-2">🎓</span>
                  KHÓA HỌC & ĐÀO TẠO
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xl">💻</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Công nghệ thông tin
                        </h4>
                        <p className="text-sm text-gray-600">
                          Đại học - Cao học
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Đào tạo kỹ sư, cử nhân CNTT chất lượng cao với các chuyên
                      ngành...
                    </p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      Xem chi tiết →
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xl">📡</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Viễn thông
                        </h4>
                        <p className="text-sm text-gray-600">
                          Đại học - Sau đại học
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Chương trình đào tạo kỹ sư viễn thông với các hướng chuyên
                      sâu...
                    </p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-yellow-900 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-lg flex items-center">
                  <span className="mr-2">📷</span>
                  HÌNH ẢNH HOẠT ĐỘNG
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
                  <div className=" bg-gray-200 aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full"
                      src="https://actvn.edu.vn/News/GetImage/28481"
                      alt=""
                    />
                  </div>
                  <div className=" bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full"
                      src="https://actvn.edu.vn/News/GetImage/28208"
                      alt=""
                    />
                  </div>
                  <div className=" bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full"
                      src="https://actvn.edu.vn/News/GetImage/28483"
                      alt=""
                    />
                  </div>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full"
                      src="https://actvn.edu.vn/News/GetImage/28180"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Liên kết website */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-sm uppercase">
                  Liên kết website
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <a
                  href="#"
                  className="block text-sm text-blue-800 hover:text-blue-600 py-1 border-b border-gray-100"
                >
                  🌐 Portal đào tạo
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-800 hover:text-blue-600 py-1 border-b border-gray-100"
                >
                  📚 Thư viện số
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-800 hover:text-blue-600 py-1 border-b border-gray-100"
                >
                  🎓 E-learning
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-800 hover:text-blue-600 py-1"
                >
                  💼 Tuyển dụng
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-sm uppercase">
                  Thống kê truy cập
                </h3>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  2,847
                </div>
                <div className="text-sm text-gray-600">
                  Lượt truy cập hôm nay
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tổng: 124,568 lượt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-sm uppercase">Video clip</h3>
              </div>
              <div className="w-full">
                <div className="aspect-w-16 aspect-h-2">
                  <iframe
                    src="https://www.youtube.com/embed/NVQ1gqq8n_Y"
                    title="Video giới thiệu"
                    className="w-full h-50 md:h-80 lg:h-55"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Lịch sự kiện */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg">
                <h3 className="font-bold text-sm uppercase">Lịch sự kiện</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">15/09/2024</div>
                  <div className="text-gray-600">Lễ khai giảng năm học mới</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">01/10/2024</div>
                  <div className="text-gray-600">Bắt đầu đăng ký học phần</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">15/12/2024</div>
                  <div className="text-gray-600">Thi cuối kỳ học kỳ 1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">HỌC VIỆN KỸ THUẬT MẬT MÃ</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  Địa chỉ: 141 Đường Chiến Thắng - Phường Thanh Liệt - TP. Hà
                  Nội
                </p>
                <p>📞 0123456789</p>
                <p>✉️ info@kma.edu.vn</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">ĐÀO TẠO</h4>
              <div className="text-sm space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white">
                  Đại học chính quy
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Sau đại học
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Đào tạo từ xa
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Liên kết quốc tế
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">TUYỂN SINH</h4>
              <div className="text-sm space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white">
                  Đại học chính quy
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Sau đại học
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Văn bằng 2
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Học bổng
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">KẾT NỐI</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  📘
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  📷
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  🎬
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  💼
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>
              © 2024 Học viện Công nghệ Bưu chính Viễn thông. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
