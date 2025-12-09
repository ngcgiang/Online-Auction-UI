import { Outlet } from 'react-router-dom';
import Header from './header.jsx';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Header luôn nằm trên cùng */}
      
      {/* Outlet là nơi nội dung các trang con (Home, Products) sẽ hiển thị */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer (nếu có) sẽ nằm ở đây */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        Footer Content
      </footer>
    </div>
  );
};

export default MainLayout;