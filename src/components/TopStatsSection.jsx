import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Gavel, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, calculateTimeRemaining } from "@/services/productService";

export function TopStatsSection({ endingSoon, mostBidded, highestPrice, loading }) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ending Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Top 5 sản phẩm gần kết thúc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endingSoon && endingSoon.length > 0 ? (
                endingSoon.map((product) => {
                  const timeLeft = calculateTimeRemaining(product.end_time);
                  return (
                    <div
                      key={product.product_id}
                      className="flex justify-between items-start p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.product_name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {timeLeft.text}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary mt-1">
                          {formatPrice(product.current_price)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có sản phẩm
                </p>
              )}
              <button className="w-full flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-2">
                <span>Xem tất cả</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Most Bidded */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Top 5 sản phẩm có nhiều lượt ra giá nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostBidded && mostBidded.length > 0 ? (
                mostBidded.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex justify-between items-start p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.product_name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Gavel className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {product.bid_count || 0} lượt
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(product.current_price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có sản phẩm
                </p>
              )}
              <button className="w-full flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-2">
                <span>Xem tất cả</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Highest Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Top 5 sản phẩm có giá cao nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highestPrice && highestPrice.length > 0 ? (
                highestPrice.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex justify-between items-start p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.product_name}
                      </p>
                      <p className="text-base font-bold text-primary mt-2">
                        {formatPrice(product.current_price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có sản phẩm
                </p>
              )}
              <button className="w-full flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-2">
                <span>Xem tất cả</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
