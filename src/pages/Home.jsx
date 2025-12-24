import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TopStatsSection } from "@/components/TopStatsSection";
import { FilterToolbar } from "@/components/FilterToolbar";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  searchProducts,
  getTopLeastTimeLeft,
  getTopMostBidded,
  getTopValueProducts,
} from "@/services/productService";

export function Home() {
  // State for top stats
  const [topStats, setTopStats] = useState({
    endingSoon: [],
    mostBidded: [],
    highestPrice: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // State for main product grid
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  });

  // State for filters
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    sortBy: "time",
    newMinutes: '',
  });

  // Fetch top stats on mount
  useEffect(() => {
    fetchTopStats();
  }, []);

  // Fetch products when filters or page changes
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const params = {
          keyword: filters.keyword || undefined,
          category: filters.category || undefined,
          sortBy: filters.sortBy,
          newMinutes: filters.newMinutes,
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
        };

        const response = await searchProducts(params);

        // Handle response structure
        if (response && response.success) {
          const productsData = response.data || [];
          const paginationData = response.pagination || {};

          setProducts(Array.isArray(productsData) ? productsData : []);
          setPagination((prev) => ({
            ...prev,
            totalPages: paginationData.totalPages || 1,
            totalItems: paginationData.totalItems || 0,
          }));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [filters, pagination.currentPage, pagination.pageSize]);

  const fetchTopStats = async () => {
    setStatsLoading(true);
    try {
      const [endingSoon, mostBidded, highestPrice] = await Promise.all([
        getTopLeastTimeLeft(),
        getTopMostBidded(),
        getTopValueProducts(),
      ]);

      setTopStats({
        endingSoon: Array.isArray(endingSoon) ? endingSoon.slice(0, 5) : [],
        mostBidded: Array.isArray(mostBidded) ? mostBidded.slice(0, 5) : [],
        highestPrice: Array.isArray(highestPrice) ? highestPrice.slice(0, 5) : [],
      });
    } catch (error) {
      console.error("Error fetching top stats:", error);
      setTopStats({
        endingSoon: [],
        mostBidded: [],
        highestPrice: [],
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
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
        );
      }
    } else {
      // Show ellipsis for large page counts
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

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
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
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
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Top Statistics Section */}
      <TopStatsSection
        endingSoon={topStats.endingSoon}
        mostBidded={topStats.mostBidded}
        highestPrice={topStats.highestPrice}
        loading={statsLoading}
      />

      {/* Filter & Search Toolbar */}
      <FilterToolbar onFilterChange={handleFilterChange} />

      {/* Main Product Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            // Show skeleton loaders
            [...Array(12)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : products.length > 0 ? (
            // Show products
            products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))
          ) : (
            // No products found
            <div className="col-span-full text-center py-16">
              <p className="text-lg text-muted-foreground">
                Không tìm thấy sản phẩm nào
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!productsLoading && products.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8">
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
      </div>
    </div>
  );
}
