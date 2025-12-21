import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Clock, DollarSign, Eye, Loader2 } from "lucide-react"
import { getWatchList } from "@/services/userService"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function UserDetailPage() {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [watchList, setWatchList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 12,
        totalPages: 1,
        totalItems: 0,
    });

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
                // Pagination logic
                const totalItems = products.length
                const totalPages = Math.ceil(totalItems / pagination.pageSize)
                setPagination((prev) => ({
                    ...prev,
                    totalItems,
                    totalPages: totalPages || 1,
                }))
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
    // eslint-disable-next-line
    }, [authUser])

    // Pagination: get current page products
    const paginatedProducts = watchList.slice(
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
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading
                            ? [...Array(pagination.pageSize)].map((_, idx) => (
                                <ProductCardSkeleton key={idx} />
                            ))
                            : paginatedProducts.map((item) => {
                                const product = item.product || item
                                return (
                                    <ProductCard
                                        key={item.product_id || product.product_id}
                                        product={product}
                                        // Optionally pass more props if needed
                                    />
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