import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {getProductDetails }  from '@/services/productService';
import PaymentForm from '../components/PaymentForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';

export default function CheckoutPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductDetails(productId);
        console.log('Fetched product:', response);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handlePaymentSuccess = (data) => {
    // Redirect to order confirmation or home page
    setTimeout(() => {
      navigate('/', {
        state: {
          message: `Thanh toán thành công! Đơn hàng #${data.orderId}`,
          type: 'success'
        }
      });
    }, 1500);
  };

    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
    };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Vui lòng đăng nhập để thanh toán</p>
            <Button onClick={() => navigate('/login')}>
              Đăng Nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div className="text-center">
            <p className="text-lg text-red-600">{error || 'Sản phẩm không tìm thấy'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Xác Nhận Đơn Hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Sản Phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {product.mainImage && (
                    <div className="w-32 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={product.mainImage}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Người bán: <strong>{product.seller?.full_name}</strong>
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(product.current_price)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Giao Hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Người Nhận Hàng
                  </label>
                  <p className="text-gray-700 p-2 bg-gray-50 rounded">
                    {user?.full_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Địa Chỉ Giao Hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Nhập địa chỉ giao hàng đầy đủ"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                  Vui lòng nhập địa chỉ giao hàng chính xác để nhận hàng kịp thời
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Payment Form */}
          <div className="lg:col-span-1">
            {shippingAddress ? (
              <PaymentForm
                productId={product.product_id}
                totalAmount={product.current_price}
                shippingAddress={`${shippingAddress}`}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-sm text-gray-600">
                    Vui lòng nhập đầy đủ thông tin giao hàng để tiếp tục thanh toán
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
