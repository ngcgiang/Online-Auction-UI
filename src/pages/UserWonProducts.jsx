import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Calendar, Loader2, TrendingUp } from "lucide-react"
import { getWonProducts } from "@/services/userService"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function UserWonProductsPage() {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [wonProducts, setWonProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 12,
        totalPages: 1,
        totalItems: 0,
    })

    useEffect(() => {
        const fetchWonProducts = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getWonProducts()
                console.log("Won Products Response:", response)
                
                // Handle different response structures
                let products = []
                if (response?.data?.list && Array.isArray(response.data.list)) {
                    products = response.data.list
                } else if (response?.data?.products && Array.isArray(response.data.products)) {
                    products = response.data.products
                } else if (Array.isArray(response?.list)) {
                    products = response.list
                } else if (Array.isArray(response?.products)) {
                    products = response.products
                } else if (Array.isArray(response)) {
                    products = response
                }
                
                const totalItems = products.length
                const totalPages = Math.ceil(totalItems / pagination.pageSize)
                setPagination((prev) => ({
                    ...prev,
                    totalItems,
                    totalPages: totalPages || 1,
                }))
                setWonProducts(products)
            } catch (err) {
                console.error("Error fetching won products:", err)
                const message = err?.response?.data?.message || "Không thể tải danh sách sản phẩm đã thắng"
                setError(message)
                toast.error(message)
                setWonProducts([])
            } finally {
                setLoading(false)
            }
        }

        if (authUser) {
            fetchWonProducts()
        }
    }, [authUser, pagination.pageSize])

    const paginatedProducts = wonProducts.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
    )

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: page }))
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const renderPaginationItems = () => {
        const items = []
        const { currentPage, totalPages } = pagination
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        isActive={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            )

            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                )
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }

            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                )
            }

            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        isActive={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            )
        }

        return items
    }

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
        if (!dateString) return "Invalid Date"
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "Invalid Date"
        const date = new Date(dateString)
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

            {!Array.isArray(wonProducts) || wonProducts.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Award className="h-16 w-16 mx-auto mb-4 text-green-400" />
                        <h3 className="text-xl font-semibold mb-2">
                            Chưa thắng sản phẩm nào
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Bạn chưa thắng đấu giá sản phẩm nào
                        </p>
                        <Button onClick={() => navigate("/products")}>
                            Khám phá sản phẩm
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map((product) => (
                            <Card 
                                key={product.product_id}
                                className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image Section */}
                                <div className="relative aspect-square bg-gray-100">
                                    <img
                                        src={product.image_url || product.images?.[0] || "/placeholder-image.jpg"}
                                        alt={product.product_name || "Product"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "/placeholder-image.jpg"
                                        }}
                                    />
                                    {(product.category?.category_name || product.category_name) && (
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                            <span className="text-xs font-medium text-gray-700">
                                                {product.category?.category_name || product.category_name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <CardContent className="p-4 flex flex-col flex-grow">
                                    {/* Title */}
                                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 min-h-[56px]">
                                        {product.product_name || "Sản phẩm"}
                                    </h3>
                                    
                                    {/* Status Badge - Removed "Đã kết thúc" */}
                                    <div className="mb-3">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <Award className="h-3 w-3" />
                                            Đã thắng
                                        </span>
                                    </div>

                                    {/* Winning Price */}
                                    <div className="mb-4">
                                        <div className="text-sm text-muted-foreground mb-1">Giá thắng</div>
                                        <div className="text-2xl font-bold text-primary">
                                            {formatPrice(product.current_price || product.highest_bid || product.final_price)}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="space-y-2 mb-4 flex-grow">
                                        {/* Bid Time */}
                                        {product.win_time && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-muted-foreground block">Thời gian thắng:</span>
                                                    <span className="font-medium block">
                                                        {formatDateTime(product.win_time)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* End Date */}
                                        <div className="flex items-start gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-muted-foreground block">Kết thúc:</span>
                                                <span className="font-medium block">
                                                    {formatDate(product.end_time)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total Bids */}
                                        {(product.bid_count !== undefined || product.total_bids !== undefined) && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-muted-foreground block">Tổng số lượt:</span>
                                                    <span className="font-medium block">
                                                        {product.bid_count || product.total_bids} lượt đấu giá
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="space-y-2 mt-auto">
                                        <Button 
                                            onClick={() => handleViewProduct(product.product_id)}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            className={
                                                pagination.currentPage === 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                    {renderPaginationItems()}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            className={
                                                pagination.currentPage === pagination.totalPages
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}