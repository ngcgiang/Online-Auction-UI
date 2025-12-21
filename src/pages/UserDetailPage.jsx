import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Clock, DollarSign, Eye, Loader2 } from "lucide-react"
import { getWatchList } from "@/services/userService"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"

export function UserDetailPage() {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [watchList, setWatchList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchWatchList = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getWatchList()
                console.log("WatchList Response:", response)
                
                // Lấy data từ response.data.list
                let products = []
                if (response?.data?.list && Array.isArray(response.data.list)) {
                    products = response.data.list
                } else if (Array.isArray(response?.list)) {
                    products = response.list
                } else if (Array.isArray(response)) {
                    products = response
                }
                
                console.log("Products:", products)
                setWatchList(products)
            } catch (err) {
                console.error("Error fetching watchlist:", err)
                const message = err?.response?.data?.message || "Không thể tải danh sách theo dõi"
                setError(message)
                toast.error(message)
                setWatchList([])
            } finally {
                setLoading(false)
            }
        }

        if (authUser) {
            fetchWatchList()
        }
    }, [authUser])

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`)
    }

    const formatPrice = (price) => {
        if (!price) return "0 ₫"
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <p className="text-red-600 font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!Array.isArray(watchList) || watchList.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">
                            Chưa có sản phẩm theo dõi
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Bạn chưa thêm sản phẩm nào vào danh sách theo dõi
                        </p>
                        <Button onClick={() => navigate("/products")}>
                            Khám phá sản phẩm
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchList.map((item) => {
                        const product = item.product || item // Handle nested product object
                        return (
                            <Card key={item.product_id || product.product_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative aspect-square">
                                    <img
                                        src={product.image_url || product.images?.[0] || "/placeholder-image.jpg"}
                                        alt={product.product_name || "Product"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "/placeholder-image.jpg"
                                        }}
                                    />
                                    <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                        {product.product_name || "Sản phẩm"}
                                    </h3>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Giá hiện tại:</span>
                                            <span className="font-semibold text-primary">
                                                {formatPrice(product.current_price || product.starting_price)}
                                            </span>
                                        </div>
                                        
                                        {product.end_time && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Kết thúc:</span>
                                                <span className="text-sm">
                                                    {formatDate(product.end_time)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {product.bid_count !== undefined && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {product.bid_count} lượt đấu giá
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Button 
                                        onClick={() => handleViewProduct(item.product_id || product.product_id)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}