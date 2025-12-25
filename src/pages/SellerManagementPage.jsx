import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from "@/components/Header";
import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerOverview from '@/components/seller/SellerOverview';
import SellerProductList from '@/components/seller/SellerProductList';
import CreateAuctionProduct from '@/components/CreateAuctionProduct';

const SellerManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const pathname = location.pathname;
    if (pathname.includes('product-list')) return 'products';
    if (pathname.includes('create')) return 'create';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  useEffect(() => {    // Update active tab when URL changes
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  useEffect(() => {    // Redirect if not authenticated
    if (!loading && !user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Redirect if user is not a seller
    if (!loading && user && user.role !== 'seller') {
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

  if (!user || user.role !== 'seller') {
    return null;
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SellerOverview />;
      case 'products':
        return <SellerProductList />;
      case 'create':
        return <CreateAuctionProduct />;
      default:
        return <SellerOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar 
          activeTab={activeTab} 
          onNavigate={(tab) => {
            setActiveTab(tab);
            // Navigate to the corresponding URL
            if (tab === 'overview') {
              navigate('/seller-management');
            } else if (tab === 'products') {
              navigate('/seller-management/product-list');
            } else if (tab === 'create') {
              navigate('/seller-management/create');
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

export default SellerManagementPage;
