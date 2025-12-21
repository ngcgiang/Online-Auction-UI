import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircleMore, Star, ThumbsUp, ThumbsDown, Calendar, User, Package, Loader2 } from "lucide-react"
import { getUserRatings } from "@/services/userService"
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

export function UserRatingsPage() {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [ratings, setRatings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState("all") // all, positive, negative
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
    })

    useEffect(() => {
        const fetchRatings = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getUserRatings()
                console.log("User Ratings Response:", response)
                
                // Handle different response structures
                let ratingsData = []
                if (response?.data?.list && Array.isArray(response.data.list)) {
                    ratingsData = response.data.list
                } else if (response?.data?.ratings && Array.isArray(response.data.ratings)) {
                    ratingsData = response.data.ratings
                } else if (Array.isArray(response?.list)) {
                    ratingsData = response.list
                } else if (Array.isArray(response?.ratings)) {
                    ratingsData = response.ratings
                } else if (Array.isArray(response)) {
                    ratingsData = response
                }
                
                setRatings(ratingsData)
            } catch (err) {
                console.error("Error fetching ratings:", err)
                const message = err?.response?.data?.message || "Không thể tải danh sách đánh giá"
                setError(message)
                toast.error(message)
                setRatings([])
            } finally {
                setLoading(false)
            }
        }

        if (authUser) {
            fetchRatings()
        }
    }, [authUser])

    // Filter ratings based on selected filter
    const filteredRatings = ratings.filter(rating => {
        if (filter === "positive") return rating.rating_point === 1
        if (filter === "negative") return rating.rating_point === 0
        return true
    })

    // Update pagination when filtered ratings change
    useEffect(() => {
        const totalItems = filteredRatings.length
        const totalPages = Math.ceil(totalItems / pagination.pageSize)
        setPagination((prev) => ({
            ...prev,
            currentPage: 1, // Reset to first page when filter changes
            totalItems,
            totalPages: totalPages || 1,
        }))
    }, [filteredRatings.length, pagination.pageSize])

    const paginatedRatings = filteredRatings.slice(
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

    const formatDate = (dateString) => {
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

    const getReviewerName = (rating) => {
        return rating.reviewer_name || rating.reviewer?.full_name || `Người dùng #${rating.reviewer_id}`
    }

    const getProductName = (rating) => {
        return rating.product_name || rating.product?.product_name || `Sản phẩm #${rating.product_id}`
    }

    const handleViewProduct = (productId) => {
        if (productId) {
            navigate(`/products/${productId}`)
        }
    }

    // Calculate statistics
    const stats = {
        total: ratings.length,
        positive: ratings.filter(r => r.rating_point === 1).length,
        negative: ratings.filter(r => r.rating_point === -1).length,
        positiveRate: ratings.length > 0 ? ((ratings.filter(r => r.rating_point === 1).length / ratings.length) * 100).toFixed(1) : 0
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <MessageCircleMore className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tích cực</p>
                                <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
                            </div>
                            <ThumbsUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tiêu cực</p>
                                <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
                            </div>
                            <ThumbsDown className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tỷ lệ tích cực</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.positiveRate}%</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    className="gap-2"
                >
                    <MessageCircleMore className="h-4 w-4" />
                    Tất cả ({stats.total})
                </Button>
                <Button
                    variant={filter === "positive" ? "default" : "outline"}
                    onClick={() => setFilter("positive")}
                    className="gap-2"
                >
                    <ThumbsUp className="h-4 w-4" />
                    Tích cực ({stats.positive})
                </Button>
                <Button
                    variant={filter === "negative" ? "default" : "outline"}
                    onClick={() => setFilter("negative")}
                    className="gap-2"
                >
                    <ThumbsDown className="h-4 w-4" />
                    Tiêu cực ({stats.negative})
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <p className="text-red-600 font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!Array.isArray(ratings) || ratings.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <MessageCircleMore className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">
                            Chưa có đánh giá
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Bạn chưa nhận được đánh giá nào từ người dùng khác
                        </p>
                    </CardContent>
                </Card>
            ) : filteredRatings.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <MessageCircleMore className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">
                            Không có đánh giá
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Không tìm thấy đánh giá nào phù hợp với bộ lọc
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Ratings List */}
                    <div className="space-y-4">
                        {paginatedRatings.map((rating) => {
                            const isPositive = rating.rating_point === 1
                            
                            return (
                                <Card 
                                    key={rating.rating_id} 
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Left Section - Rating Badge */}
                                            <div className="flex flex-col items-center justify-center md:w-32 flex-shrink-0">
                                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                                    isPositive 
                                                        ? "bg-green-100" 
                                                        : "bg-red-100"
                                                }`}>
                                                    {isPositive ? (
                                                        <ThumbsUp className="h-10 w-10 text-green-600" />
                                                    ) : (
                                                        <ThumbsDown className="h-10 w-10 text-red-600" />
                                                    )}
                                                </div>
                                                <span className={`mt-2 text-sm font-semibold ${
                                                    isPositive ? "text-green-600" : "text-red-600"
                                                }`}>
                                                    {isPositive ? "Tích cực" : "Tiêu cực"}
                                                </span>
                                            </div>

                                            {/* Middle Section - Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header with Reviewer Info */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-gray-100 rounded-full p-2">
                                                            <User className="h-4 w-4 text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {getReviewerName(rating)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(rating.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Star Rating Display */}
                                                    <div className="flex items-center gap-1">
                                                        <Star 
                                                            className={`h-5 w-5 ${
                                                                isPositive 
                                                                    ? "text-yellow-500 fill-yellow-500" 
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Review Content */}
                                                {rating.content && (
                                                    <div className="mb-3">
                                                        <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                                                            "{rating.content}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Product Info */}
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Package className="h-4 w-4" />
                                                    <span>Sản phẩm:</span>
                                                    <button
                                                        onClick={() => handleViewProduct(rating.product_id)}
                                                        className="font-medium text-primary hover:underline"
                                                    >
                                                        {getProductName(rating)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
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