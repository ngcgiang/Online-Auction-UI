import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Pencil } from 'lucide-react';
import { getProductsBySellerId, getExpiredProductsBySellerId } from '@/services/sellerService';
import { getReviewedUsers, rateUser, putRateUser } from '@/services/userService';
import { getOrderStatusByProductId } from '@/services/orderService';
import RatingModal from '../RatingModal';

const SellerProductList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('active');
  const [activeProducts, setActiveProducts] = React.useState([]);
  const [expiredProducts, setExpiredProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [reviewedUsersList, setReviewedUsersList] = React.useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = React.useState(false);
  const [selectedRatingProduct, setSelectedRatingProduct] = React.useState(null);
  const [selectedRating, setSelectedRating] = React.useState(null);
  const [paymentStatus, setPaymentStatus] = React.useState({});
  const itemsPerPage = 8;

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [activeRes, expiredRes, reviewedRes] = await Promise.all([
        getProductsBySellerId(),
        getExpiredProductsBySellerId(),
        getReviewedUsers()
      ]);
      setActiveProducts(activeRes.data || []);
      setExpiredProducts(expiredRes.data || []);
      setReviewedUsersList(reviewedRes.data?.list || []);
      
      // Fetch payment status for expired products
      if (expiredRes.data && expiredRes.data.length > 0) {
        const paymentStatusMap = {};
        for (const product of expiredRes.data) {
          try {
            const orderRes = await getOrderStatusByProductId(product.product_id);
            if (orderRes.success && orderRes.data) {
              paymentStatusMap[product.product_id] = orderRes.data.order_status === 'paid';
            }
          } catch (err) {
            console.error(`Lỗi tải trạng thái thanh toán cho sản phẩm ${product.product_id}:`, err);
            paymentStatusMap[product.product_id] = false;
          }
        }
        setPaymentStatus(paymentStatusMap);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      setActiveProducts([]);
      setExpiredProducts([]);
      setReviewedUsersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán phân trang
  const displayProducts = activeTab === 'active' ? activeProducts : expiredProducts;
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = displayProducts.slice(startIndex, endIndex);

  // Helper function: Kiểm tra xem sản phẩm đã được đánh giá chưa
  const getReviewStatus = (productId) => {
    return reviewedUsersList.find(review => review.product_id === productId);
  };

  // Handle mở rating modal
  const handleOpenRatingModal = (product) => {
    setSelectedRatingProduct(product);
    setIsRatingModalOpen(true);
  };

  // Handle submit rating
  const handleRatingSubmit = async (data) => {
    try {
      if (selectedRating) {
        // Edit mode
        await putRateUser(selectedRating.rating_id, {
          ratingPoint: data.ratingPoint,
          content: data.content,
        });
      } else {
        // Create mode
        await rateUser(data);
      }
      // Reload reviewed users list
      const reviewedRes = await getReviewedUsers();
      setReviewedUsersList(reviewedRes.data?.list || []);
      setSelectedRating(null);
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
    }
  };

  // Handle edit rating
  const handleEditRating = (productId) => {
    const product = expiredProducts.find(p => p.product_id === productId);
    const rating = reviewedUsersList.find(r => r.product_id === productId);
    
    if (product && rating) {
      setSelectedRatingProduct(product);
      setSelectedRating(rating);
      setIsRatingModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Danh sách sản phẩm</h1>
        <p className="text-muted-foreground mt-2">Quản lý các sản phẩm đã đăng của bạn</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 hover:text-foreground'
            }`}
          >
            Đang hoạt động ({activeProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'expired'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 hover:text-foreground'
            }`}
          >
            Đã kết thúc ({expiredProducts.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600 font-medium mb-2">
            {activeTab === 'active' ? 'Chưa có sản phẩm đang hoạt động' : 'Chưa có sản phẩm đã kết thúc'}
          </p>
          <p className="text-slate-500 text-sm">
            {activeTab === 'active' 
              ? 'Hãy bắt đầu bằng cách đăng sản phẩm đầu tiên của bạn' 
              : 'Các sản phẩm của bạn sẽ xuất hiện ở đây khi kết thúc'}
          </p>
        </div>
      ) : activeTab === 'active' ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hình ảnh</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Giá hiện tại</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Người thắng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Thời gian còn lại</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleProductClick(product.product_id)}>
                  <td className="px-6 py-4">
                    {product.mainImage ? (
                      <img 
                        src={product.mainImage} 
                        alt={product.product_name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-slate-200 flex items-center justify-center">
                        <span className="text-xs text-slate-500">Không ảnh</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {product.product_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-semibold">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      minimumFractionDigits: 0
                    }).format(product.current_price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {product.winner?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {product.remainingHours !== undefined ? (
                      <span>{product.remainingHours} giờ</span>
                    ) : (
                      <span className="text-slate-500">Chưa có</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Giá bán</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Người thắng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Điểm đánh giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Đánh giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => {
                const hasWinner = product.winnerStatus === 'Has Winner';
                return (
                  <tr key={product.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-semibold">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        minimumFractionDigits: 0
                      }).format(product.current_price || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {hasWinner ? (
                        <span className="text-foreground">{product.winner?.full_name}</span>
                      ) : (
                        <span className="text-slate-500">Không ai đấu giá</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {hasWinner ? (
                        <span className="text-foreground font-medium">{product.winner?.rating_score || 0}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasWinner ? (
                        (() => {
                          const reviewStatus = getReviewStatus(product.product_id);
                          return reviewStatus ? (
                            // Đã đánh giá
                            <div className="flex items-center gap-2">
                              {reviewStatus.rating_point === 1 ? (
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                              )}
                              <button
                                onClick={() => handleEditRating(product.product_id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                                Sửa
                              </button>
                            </div>
                          ) : (
                            // Chưa đánh giá
                            <button
                              onClick={() => handleOpenRatingModal(product)}
                              className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                            >
                              Đánh giá người mua
                            </button>
                          );
                        })()
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasWinner ? (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium text-center inline-block ${
                          paymentStatus[product.product_id]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {paymentStatus[product.product_id] ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
              <div className="text-sm text-slate-600">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center h-10 px-4 rounded border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center h-10 px-4 rounded border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

          )}

    {/* Rating Modal */}
    {selectedRatingProduct && (
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setSelectedRatingProduct(null);
          setSelectedRating(null);
        }}
        targetUser={{
          id: selectedRatingProduct.winner?.user_id,
          name: selectedRatingProduct.winner?.full_name
        }}
        productId={selectedRatingProduct.product_id}
        initialData={selectedRating}
        onSubmit={handleRatingSubmit}
      />
    )}
    </div>
  );
};

export default SellerProductList;
