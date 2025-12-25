import React, { useState, useEffect } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { refuseBidder } from '@/services/sellerService';
import { toast } from 'react-toastify';

/**
 * BidderList Component
 * 
 * Hiển thị danh sách người đấu giá cho Seller với chức năng chặn người dùng
 * 
 * Props:
 * - productId: string | number - ID của sản phẩm
 * - bidders: Array - Mảng các bidders
 * - onBidderRemoved: Function - Callback khi một bidder bị chặn
 */
export default function BidderList({ 
  productId, 
  bidders = [],
  onBidderRemoved 
}) {
  const [biddersList, setBiddersList] = useState(bidders);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Sync biddersList khi props bidders thay đổi
  useEffect(() => {
    setBiddersList(bidders);
  }, [bidders]);

  // Format tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format thời gian
  const formatBidTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const timeStr = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateStr = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
      return `${timeStr} ${dateStr}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Xác nhận chặn người dùng
  const handleConfirmRefuse = async () => {
    if (!selectedBidder) return;

    setIsRemoving(true);
    try {
      await refuseBidder(productId, selectedBidder.bidder_id);

      // Loại bỏ bidder khỏi danh sách
      const updatedBidders = biddersList.filter(
        (b) => b.bidder_id !== selectedBidder.bidder_id
      );
      setBiddersList(updatedBidders);

      toast.success(`Đã chặn ${selectedBidder.full_name} thành công`);

      // Gọi callback nếu có
      if (onBidderRemoved) {
        onBidderRemoved(selectedBidder.bidder_id);
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi chặn người dùng';
      toast.error(errorMessage);
      console.error('Error refusing bidder:', error);
    } finally {
      setIsRemoving(false);
      setIsConfirming(false);
      setSelectedBidder(null);
    }
  };

  // Mở dialog xác nhận
  const handleOpenConfirm = (bidder) => {
    setSelectedBidder(bidder);
    setIsConfirming(true);
  };

  // Nếu không có bidders
  if (!biddersList || biddersList.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Danh sách người đấu giá</CardTitle>
              <CardDescription className="text-xs mt-1">
                {biddersList.length} người đã tham gia
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Scrollable Bidders List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {biddersList.map((bidder) => (
              <div
                key={bidder.bidder_id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                {/* Left Section: Avatar + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">

                  {/* Bidder Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {bidder.full_name}
                      </p>
                      {bidder.rating_score > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded whitespace-nowrap">
                          ⭐ {bidder.rating_score}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {bidder.email}
                    </p>
                  </div>
                </div>

                {/* Middle Section: Bid Amount + Time */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(parseFloat(bidder.bid_amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBidTime(bidder.bid_time)}
                  </p>
                </div>

                {/* Right Section: Block Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleOpenConfirm(bidder)}
                  title="Chặn người dùng này"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {biddersList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Chưa có người đấu giá
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Block Dialog */}
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Chặn người dùng?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc muốn chặn lượt ra giá của{' '}
                <span className="font-semibold text-foreground">
                  {selectedBidder?.full_name}
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                Giá: <span className="font-medium">{selectedBidder && formatPrice(parseFloat(selectedBidder.bid_amount))}</span>
              </p>
              <p className="text-xs text-amber-600 font-medium mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRefuse}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRemoving ? 'Đang xử lý...' : 'Chặn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
