import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import UserManagement from '@/components/admin/UserManagement';

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Redirect if user is not an admin
    if (!loading && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'categories':
        return <CategoryManagement />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          activeSection={activeSection} 
          onNavigate={setActiveSection}
          isOpen={isSidebarOpen}
          onToggle={setIsSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagementPage;
