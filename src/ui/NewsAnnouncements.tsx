import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export const NewsAnnouncements: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const services = [
    {
      id: 1,
      title: "Chứng chỉ số cá nhân",
      description:
        "Chứng thực chữ ký số cho cá nhân, đáp ứng đầy đủ tiêu chuẩn pháp lý",
      price: "199.000đ/năm",
      features: ["Ký hợp đồng điện tử", "Kê khai thuế", "Giao dịch ngân hàng"],
      color: "red",
    },
    {
      id: 2,
      title: "Chứng chỉ số doanh nghiệp",
      description: "Chứng thực chữ ký số cho doanh nghiệp, tổ chức",
      price: "1.299.000đ/năm",
      features: ["Ký hóa đơn điện tử", "Kê khai thuế", "Giao dịch chứng khoán"],
      color: "red",
    },
    {
      id: 3,
      title: "Ký số từ xa",
      description: "Ký số mọi lúc, mọi nơi không cần thiết bị chuyên dụng",
      price: "Liên hệ",
      features: ["Ký trên mobile", "Bảo mật cao", "Tiện lợi"],
      color: "red",
    },
    {
      id: 4,
      title: "Hóa đơn điện tử",
      description: "Giải pháp hóa đơn điện tử toàn diện cho doanh nghiệp",
      price: "Liên hệ",
      features: ["Tích hợp ERP", "Tuân thủ pháp luật", "Báo cáo tự động"],
      color: "red",
    },
  ];

  const features = [
    {
      title: "Không cần thiết bị chuyên dụng",
      description: "Ký số mọi lúc mọi nơi trên điện thoại, máy tính",
      icon: "📱",
    },
    {
      title: "Đáp ứng tiêu chuẩn pháp lý",
      description: "Tuân thủ quy định của Bộ TT&TT và tiêu chuẩn quốc tế",
      icon: "⚖️",
    },
    {
      title: "Bảo mật tuyệt đối",
      description: "Khóa lưu trữ tập trung trên HSM Cloud đạt chuẩn EAL4+",
      icon: "🔒",
    },
    {
      title: "Quản lý thuận tiện",
      description: "Theo dõi lịch sử giao dịch dễ dàng trên Web/App",
      icon: "📊",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-red-600">
                Đối tác tích hợp
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Giải pháp
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Bảng giá
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Khuyến mại
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Công cụ
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Hỗ trợ
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600">
                Liên hệ
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                className="w-20 h-20"
                src="https://storage.googleapis.com/hvktmm.appspot.com/2022-12-16/5807675312963584/logo_app_tiny_31.1k.png"
                alt=""
              />
              <div>
                <div className="text-xs text-gray-500">
                  HỌC VIỆN KỸ THUẬT MẬT MÃ
                </div>
                <div className="text-lg font-bold text-gray-800">
                  HỆ THỐNG KÝ SỐ
                </div>
              </div>
            </div>

            <nav className="flex space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Trang chủ
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Giới thiệu
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Dịch vụ
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Tin tức
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Hỗ trợ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Banner với Swiper */}
      <div className=" text-white">
        <div className="container max-w-full">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={false}
            modules={[Autoplay, Pagination, Navigation]}
            className="h-full w-full" // Thêm w-full ở đây
          >
            <SwiperSlide>
              <div className="w-full h-full">
                <img
                  src="https://actvn.edu.vn/News/GetImage/28237"
                  alt=""
                  className="w-full h-full object-cover" // Thêm object-cover
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full h-full">
                <img
                  src="https://tuyensinh.actvn.edu.vn/wp-content/uploads/2025/06/br1-2-1536x581.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      {/* Dịch vụ chính */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              DỊCH VỤ CHÍNH
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cung cấp các giải pháp ký số toàn diện cho cá nhân và doanh nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="h-2 bg-red-600"></div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 text-lg mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-red-600 font-bold text-xl">
                      {service.price}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tính năng nổi bật */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            TÍNH NĂNG NỔI BẬT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảo mật & Pháp lý */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                BẢO MẬT & PHÁP LÝ
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Tính chống chối bỏ
                    </h4>
                    <p className="text-gray-600">
                      Sau khi ký sẽ không thể xóa bỏ chữ ký khỏi văn bản.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Tính toàn vẹn
                    </h4>
                    <p className="text-gray-600">
                      Văn bản không thể chỉnh sửa sau khi thực hiện ký số.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xl">👤</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Tính xác thực
                    </h4>
                    <p className="text-gray-600">
                      Xác thực chính xác thông tin người ký số trên văn bản.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Cần tư vấn thêm?
              </h3>
              <p className="text-gray-600 mb-6">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ 24/7
              </p>
              <div className="flex space-x-4">
                <button className="border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 font-medium">
                  Liên hệ tư vấn
                </button>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium">
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">
                HỆ THỐNG KÝ SỐ THÔNG MINH
              </h4>
              <div className="text-gray-300 space-y-2 text-sm">
                <p>HỌC VIỆN KỸ THUẬT MẬT MÃ</p>
                <p>Địa chỉ: 141 Đường Chiến Thắng, Thanh Liệt, Hà Nội</p>
                <p>📞 (024) 1234 5678</p>
                <p>✉️ info@kma.edu.vn</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">DỊCH VỤ</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-white">
                  Chứng chỉ số
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Ký số điện tử
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Hóa đơn điện tử
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Bảo mật dữ liệu
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">HỖ TRỢ</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-white">
                  Hướng dẫn sử dụng
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Câu hỏi thường gặp
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Tài liệu kỹ thuật
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Liên hệ hỗ trợ
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">KẾT NỐI</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-300 hover:text-white text-2xl">
                  📘
                </a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl">
                  📷
                </a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl">
                  🎬
                </a>
              </div>
              <div className="text-sm text-gray-300">
                <p>© 2024 Học viện Kỹ thuật Mật mã</p>
                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
