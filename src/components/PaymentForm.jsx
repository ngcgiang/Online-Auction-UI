import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/paymentService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function PaymentForm({ productId, totalAmount, shippingAddress, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ===== BƯỚC 1: Tạo Payment Intent =====
      console.log('Step 1: Creating payment intent...');
      const paymentIntentData = await createPaymentIntent({
        productId,
        totalAmount,
        shippingAddress,
        description: `Thanh toán sản phẩm ${productId}`,
      });

      console.log('Payment intent created:', paymentIntentData);
      setPaymentData(paymentIntentData);

      // ===== BƯỚC 2: Xử Lý Thanh Toán Với Stripe =====
      console.log('Step 2: Processing payment with Stripe...');
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(
          paymentIntentData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                address: {
                  line1: shippingAddress,
                },
              },
            },
          }
        );

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
        return;
      }

      console.log('Stripe payment succeeded:', paymentIntent);

      // ===== BƯỚC 3: Xác Nhận Thanh Toán Với Server =====
      console.log('Step 3: Confirming payment with backend...');
      const confirmationData = await confirmPayment(
        paymentIntentData.paymentIntentId
      );

      console.log('Payment confirmed:', confirmationData);
      setSuccess(true);
      setError(null);

      // Reset form
      elements.getElement(CardElement).clear();

      // Gọi callback success
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(confirmationData);
        }, 1500);
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Thanh toán thất bại. Vui lòng thử lại.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông Tin Thanh Toán</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sản phẩm:</span>
              <span className="font-medium">{productId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Địa chỉ giao:</span>
              <span className="font-medium">{shippingAddress}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-lg font-medium">Tổng tiền:</span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="card-element" className="block text-sm font-medium">
              Thông Tin Thẻ
            </label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424242',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#d32f2f',
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">
                ❌ {error}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm font-medium">
                ✅ Thanh toán thành công! Đơn hàng #{paymentData?.orderId}
              </p>
            </div>
          )}

          {paymentData && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="text-blue-700">
                <strong>Order ID:</strong> {paymentData.orderId}
              </p>
              <p className="text-blue-700">
                <strong>Payment Intent:</strong> {paymentData.paymentIntentId.substring(0, 20)}...
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading || success}
            className="w-full h-12 text-base font-medium"
          >
            {isLoading && '🔄 Đang xử lý...'}
            {!isLoading && !success && `Thanh toán ${totalAmount}`}
            {success && '✅ Thanh toán thành công'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Giao dịch được bảo vệ bởi Stripe. Thông tin thẻ của bạn được mã hóa an toàn.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
