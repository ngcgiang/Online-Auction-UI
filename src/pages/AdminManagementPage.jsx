import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from "@/components/Header";
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import UserManagement from '@/components/admin/UserManagement';

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determine active section from URL
  const getActiveSectionFromUrl = () => {
    const pathname = location.pathname;
    if (pathname.includes('categories')) return 'categories';
    if (pathname.includes('products')) return 'products';
    if (pathname.includes('users')) return 'users';
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromUrl());

  useEffect(() => {    // Update active section when URL changes
    setActiveSection(getActiveSectionFromUrl());
  }, [location.pathname]);

  useEffect(() => {    // Redirect if not authenticated
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
      {/* Header */}
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          activeSection={activeSection} 
          onNavigate={(section) => {
            setActiveSection(section);
            // Navigate to the corresponding URL
            if (section === 'dashboard') {
              navigate('/admin-management');
            } else if (section === 'categories') {
              navigate('/admin-management/categories');
            } else if (section === 'products') {
              navigate('/admin-management/products');
            } else if (section === 'users') {
              navigate('/admin-management/users');
            }
            // Close sidebar on mobile after selection
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
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
