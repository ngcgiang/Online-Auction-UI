import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Gavel, Calendar, Heart } from "lucide-react";
import { formatPrice, calculateTimeRemaining } from "@/services/productService";
import { addToWatchList, removeFromWatchList, getWatchListByUserId } from "@/services/watchListService";
import { useAuth } from "@/context/AuthContext";

const getPermissionBadge = (permission) => {
  return (
    <div className="flex items-center gap-1 mb-2">
      <span className="text-xs text-muted-foreground">
        {permission ? 'Công khai' : 'Riêng tư'}
      </span>
    </div>
  );
};

export function ProductCard({ product, loading }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Load favorite status on mount or when user/product changes
  useEffect(() => {
    if (user && product) {
      loadFavoriteStatus();
    }
  }, [user, product?.product_id]);

  const loadFavoriteStatus = async () => {
    try {
      const response = await getWatchListByUserId(user.user_id);
      const watchListIds = response.data.map(item => item.product_id);
      setIsFavorited(watchListIds.includes(product.product_id));
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (isFavorited) {
        await removeFromWatchList(user.user_id, product.product_id);
      } else {
        await addToWatchList(user.user_id, product.product_id);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error updating favorite:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Skeleton className="w-full h-48" />
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) return null;

  const timeLeft = calculateTimeRemaining(product.end_time);
  const isSold = product.status === "sold" || product.status === "ended";

  const handleClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative bg-muted h-48 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <img
            src={product.avatar || "/placeholder-image.png"}
            alt={product.product_name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
          />
        </div>
        
        {/* Status Badge */}
        {isSold && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 z-10"
          >
            Đã bán
          </Badge>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoadingFavorite}
          className="absolute top-2 left-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
          title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorited
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Product Title */}
        <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.product_name}
        </h3>
        {getPermissionBadge(product.permission)}

        {/* Current Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.current_price)}
          </p>
        </div>
        {/* Buy now value */}
        {product.buy_now_price && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Giá mua ngay: <span className="text-lg font-bold text-primary">{formatPrice(product.buy_now_price)}</span>
            </p>
          </div>
        )}

        {/* Bottom Info Block */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {/* Highest Bidder */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Người đấu giá cao nhất:</span>
            <span className="truncate">
              {product.winner_id ? `User ${product.winner_id}` : "Chưa có"}
            </span>
          </div>

          {/* Date Posted */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(product.start_time).toLocaleDateString("vi-VN")}
            </span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className={timeLeft.isEnded ? "text-destructive" : ""}>
              {timeLeft.text}
            </span>
          </div>

          {/* Total Bids */}
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            <span>{product.bidCount || 0} lượt đấu giá</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return <ProductCard loading={true} />;
}
