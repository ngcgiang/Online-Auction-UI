import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import CreateAuctionProduct from '@/components/CreateAuctionProduct';

const SellerManagementPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
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

  return (
    <div>
      <CreateAuctionProduct />
    </div>
  );
};

export default SellerManagementPage;
