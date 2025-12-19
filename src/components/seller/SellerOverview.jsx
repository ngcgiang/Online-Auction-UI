import React from 'react';

const SellerOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
        <p className="text-muted-foreground mt-2">Xem thông tin tổng quan về tài khoản bán hàng của bạn</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          ⚠️ Chức năng đang phát triển. Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
};

export default SellerOverview;
