import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Star, Clock, User, Gavel, ArrowLeft, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatPrice, getProductDetails, getProductQnA, getRelatedProducts } from "@/services/productService";
import { getBidsByProductId, placeBid } from "@/services/bidService";
import { QnAThread } from "@/components/QnAThread";
import { useProductSocket } from "@/hooks/useProductSocket";
import { formatTimeRemaining } from "@/lib/socket";
import { Header } from "@/components/Header";
import { BidInput } from "@/components/BidInput";

export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qnaData, setQnaData] = useState([]);
  const [qnaLoading, setQnaLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidLoading, setBidLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("--:--:--");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getProductDetails(productId);
        if (response && response.success) {
          setProduct(response.data);
        } else {
          setError("Không thể tải thông tin sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Đã xảy ra lỗi khi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Socket.io integration for real-time price and bid updates
  useProductSocket(
    productId,
    // onPriceUpdate callback
    (data) => {
      if (data) {
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            current_price: data.currentPrice,
            bid_count: data.bidCount || prev.bid_count,
            winner: data.winner || prev.winner,
            end_time: data.endTime || prev.end_time,
          };
        });

        // Update time remaining if end_time is provided
        if (data.endTime) {
          setTimeRemaining(formatTimeRemaining(data.endTime));
        }
      }
    },
    // onBidHistoryUpdate callback
    (bids) => {
      if (Array.isArray(bids)) {
        setBidHistory(bids);
      }
    },
    // onConnectionEstablished callback
    () => {
      setSocketConnected(true);
    },
    // onConnectionError callback
    () => {
      setSocketConnected(false);
    }
  );

  // Timer to update time remaining every second
  useEffect(() => {
    if (!product?.end_time) return;

    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(product.end_time));
    }, 1000);

    return () => clearInterval(timer);
  }, [product?.end_time]);

  useEffect(() => {
    const fetchQnA = async () => {
      if (!productId) return;
      
      setQnaLoading(true);
      try {
        const response = await getProductQnA(productId);
        if (Array.isArray(response)) {
          // Filter to get only top-level comments (parent_comment_id === null)
          const topLevelComments = response.filter(comment => comment.parent_comment_id === null);
          setQnaData(topLevelComments);
        } else if (response?.data && Array.isArray(response.data)) {
          const topLevelComments = response.data.filter(comment => comment.parent_comment_id === null);
          setQnaData(topLevelComments);
        }
      } catch (err) {
        console.error("Error fetching Q&A:", err);
        setQnaData([]);
      } finally {
        setQnaLoading(false);
      }
    };

    fetchQnA();
  }, [productId]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!productId) return;
      
      setRelatedLoading(true);
      try {
        const response = await getRelatedProducts(productId);
        if (response?.success && Array.isArray(response.data)) {
          setRelatedProducts(response.data);
        } else if (Array.isArray(response)) {
          setRelatedProducts(response);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [productId]);

  useEffect(() => {
    const fetchBids = async () => {
      if (!productId) return;
      
      setBidLoading(true);
      try {
        const response = await getBidsByProductId(productId);
        if (response?.success && Array.isArray(response.data)) {
          setBidHistory(response.data);
        } else if (Array.isArray(response)) {
          setBidHistory(response);
        }
      } catch (err) {
        console.error("Error fetching bid history:", err);
        setBidHistory([]);
      } finally {
        setBidLoading(false);
      }
    };

    fetchBids();
  }, [productId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return formatDate(dateString);
  };

  const handleBuyNow = () => {
    console.log("Buy now clicked");
    // API call would go here
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;
    console.log("Asking question:", newQuestion);
    setNewQuestion("");
    // API call would go here
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">Đang đấu giá</Badge>;
      case "expired":
        return <Badge variant="destructive">Đã kết thúc</Badge>;
      case "sold":
        return <Badge variant="destructive">Đã bán</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <Skeleton className="aspect-square w-full mb-4" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-16 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-3">
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
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">
                {error || "Không tìm thấy sản phẩm"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Back Button */}
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
        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  <div className="lg:col-span-4">
                    {/* Main Image */}
                    <div className="mb-4">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {product.mainImage ? (
                          <img
                            src={selectedImage === 0 ? product.mainImage : product.subImages?.[selectedImage - 1]}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            Ảnh sản phẩm
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <button
                        onClick={() => setSelectedImage(0)}
                        className={`aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center border-2 transition-colors ${
                          selectedImage === 0
                            ? "border-primary"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        {product.mainImage ? (
                          <img
                            src={product.mainImage}
                            alt="Main"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">1</span>
                        )}
                      </button>
                      {product.subImages?.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index + 1)}
                          className={`aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center border-2 transition-colors ${
                            selectedImage === index + 1
                              ? "border-primary"
                              : "border-transparent hover:border-border"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Sub ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Wishlist & Seller Info */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? "text-red-500" : ""}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{product.seller.full_name}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {product.seller.rating_score}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Product Info & Bidding */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product.product_name}
              </h1>
              {getStatusBadge(product.status)}
            </div>

            {/* Current Price */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Giá hiện tại
              </p>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(product.current_price)}
              </p>
              {/* Time Remaining */}
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {timeRemaining === "--:--:--" ? "Tính toán..." : timeRemaining}
                </span>
              </div>
            </div>

            {/* Highest Bidder */}
            {product.winner && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Người giữ giá cao nhất:
                </span>
                <span className="font-medium">{product.winner.full_name}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-muted-foreground">
                    {product.winner.rating_score}
                  </span>
                </div>
              </div>
            )}

            {/* Bidding Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gavel className="h-4 w-4" />
                  Đấu giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BidInput
                  currentPrice={product.current_price || 0}
                  stepPrice={parseFloat(product.price_step) || 0}
                  placeBid={async (bidAmount) => {
                    return new Promise((resolve, reject) => {
                      placeBid(product.product_id, bidAmount)
                        .then((response) => {
                          if (response?.success) {
                            resolve();
                          } else {
                            reject(new Error(response?.message || "Đặt giá thất bại"));
                          }
                        })
                        .catch((err) => {
                          reject(err);
                        });
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* Buy Now Section */}
            {product.buy_now_value && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Giá mua ngay
                      </p>
                      <p className="text-2xl font-bold">
                        {formatPrice(parseFloat(product.buy_now_value))}
                      </p>
                    </div>
                    <Button onClick={handleBuyNow} size="lg" variant="default">
                      Mua ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Thời điểm bắt đầu
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(product.start_time)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Thời điểm kết thúc
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(product.end_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Info */}
            {product.category && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Danh mục</p>
                <p className="font-medium">{product.category.category_name}</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Transaction History */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
                {/* Socket Connection Status */}
                <div className="flex items-center gap-1">
                  {socketConnected ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {bidLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : bidHistory.length > 0 ? (
                    bidHistory.map((bid) => (
                      <div
                        key={bid.bid_id}
                        className="p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{bid.bidder.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(bid.bid_time)}
                          </span>
                        </div>
                            <p className="text-sm font-semibold text-primary">
                                {isNaN(parseFloat(bid.amount)) 
                                    ? bid.amount 
                                    : formatPrice(parseFloat(bid.amount))}
                            </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Chưa có bids nào
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BOTTOM SECTION: Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mô tả chi tiết sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            {product.descriptions && product.descriptions.length > 0 ? (
              <div className="space-y-6">
                {product.descriptions.map((desc) => (
                  <div key={desc.des_id} className="border-l-4 border-primary/20 pl-4">
                    <div
                      className="prose prose-slate max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: desc.description }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Cập nhật: {formatDate(desc.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có mô tả chi tiết</p>
            )}
          </CardContent>
        </Card>

        {/* Q&A SECTION */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hỏi & Đáp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ask Question Form */}
            <div>
              <p className="text-sm font-medium mb-3">Bạn có câu hỏi? Hãy hỏi người bán</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                />
                <Button onClick={handleAskQuestion} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Questions & Answers List */}
            <div className="border-t pt-6">
              <p className="text-sm font-medium mb-4">
                Các câu hỏi từ cộng đồng ({qnaData.length})
              </p>

              {qnaLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : qnaData.length > 0 ? (
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {qnaData.map((comment) => (
                    <QnAThread key={comment.comment_id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RELATED PRODUCTS SECTION */}
        {!relatedLoading && relatedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sản phẩm liên quan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-min">
                  {relatedProducts.map((product) => (
                    <button
                      key={product.product_id}
                      onClick={() => navigate(`/product/${product.product_id}`)}
                      className="shrink-0 w-48 group hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].img_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Không có ảnh
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {product.product_name}
                        </h3>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.current_price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

