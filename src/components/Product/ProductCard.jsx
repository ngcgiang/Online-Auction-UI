import React from 'react';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      return 'Đã kết thúc';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else {
      return `${minutes} phút`;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'expired':
        return 'bg-red-50 text-red-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const postDate = new Date(product.start_time).toLocaleDateString('vi-VN', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative w-full bg-gray-100" style={{ paddingBottom: '100%' }}>
        <img
          src={product.avatar}
          alt={product.product_name}
          className="absolute top-0 left-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
          {product.status}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-3 text-sm">
          {product.product_name}
        </h3>

        {/* Current Price */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Giá hiện tại</p>
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(parseFloat(product.current_price))}
          </p>
        </div>

        {/* Highest Bidder Info */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Người đặt giá cao nhất</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {product.highestBidder?.full_name || 'Chưa có'}
            </span>
            {product.highestBidder && (
              <span className="text-xs text-gray-600">
                {formatRating(product.highestBidder.rating_score)}
              </span>
            )}
          </div>
        </div>

        {/* Buy Now Price */}
        {product.buy_now_value && (
          <div className="mb-3">
            <p className="text-xs text-gray-500">Mua ngay</p>
            <p className="text-sm font-semibold text-gray-700">
              {formatPrice(parseFloat(product.buy_now_value))}
            </p>
          </div>
        )}

        {/* Meta Info Row 1 - Date and Time Remaining */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">Ngày đăng</span>
            <span className="text-gray-700 font-medium">{postDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">Thời gian còn</span>
            <span className={`font-medium ${product.status === 'expired' ? 'text-red-600' : 'text-gray-700'}`}>
              {calculateTimeRemaining(product.end_time)}
            </span>
          </div>
        </div>

        {/* Bid Count */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{product.bidCount}</span> lượt ra giá
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
