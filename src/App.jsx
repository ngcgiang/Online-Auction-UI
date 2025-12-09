import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout'; // Import Layout
import Home from './pages/Home.jsx';

function App() {
  return (
    <Routes>
      {/* Các trang dùng chung Header sẽ nằm trong Route cha này */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />           {/* Trang chủ */}
      </Route>

      {/* Các trang KHÔNG cần Header (như Login/Register) để ra ngoài */}
      <Route path="/login" element={<div>Trang Login</div>} />
    </Routes>
  );
}

export default App;