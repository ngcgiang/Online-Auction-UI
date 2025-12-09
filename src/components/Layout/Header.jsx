import { Link } from 'react-router-dom';
import { useState } from 'react'; // Dùng tạm useState để test giao diện

const Header = () => {
  // Giả lập trạng thái đăng nhập (Sau này bạn sẽ lấy từ Context hoặc Redux)
  // Thử đổi thành true để xem giao diện khi đã đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // Giả lập thông tin user
  const user = {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=3" // Ảnh mẫu online
  };

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        
        {/* 1. Logo / Tên Web */}
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          AuctionPro
        </Link>

        {/* Menu điều hướng (Optional) */}
        <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <Link to="/about" className="hover:text-blue-600">Giới thiệu</Link>
        </nav>

        {/* 3. Khu vực User / Auth */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ---
            <div className="flex items-center gap-3 cursor-pointer group relative">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Chào, {user.name}
              </span>
              <img 
                src={user.avatar} 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full border border-gray-200 object-cover"
              />
              
              {/* Dropdown menu đơn giản (hiện khi hover) */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 hidden group-hover:block z-50">
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Hồ sơ cá nhân</Link>
                <Link to="/my-bids" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Lịch sử đấu giá</Link>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            // --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP ---
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md transition"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;