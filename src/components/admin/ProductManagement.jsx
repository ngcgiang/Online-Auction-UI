import React, { useState, useEffect } from 'react';
import { deleteProduct } from '@/services/adminService';
import { searchProducts, getAllProducts } from '@/services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      // Use searchProducts if there's a search query, otherwise get all products
      if (searchQuery.trim()) {
        response = await searchProducts({
          keyword: searchQuery,
          page: currentPage,
        });
      } else {
        response = await getAllProducts(currentPage);
      }
      
      // Extract products and pagination info from response
      const productList = response.data || [];
      const paginationInfo = response.pagination || {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      };
      
      setProducts(productList);
      setPagination(paginationInfo);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi tải sản phẩm',
      });
      // Set empty state on error
      setProducts([]);
      setPagination({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteReason.trim()) {
      setMessage({
        type: 'error',
        text: 'Vui lòng nhập lý do xóa',
      });
      return;
    }

    try {
      await deleteProduct(deleteConfirm);
      setProducts((prev) =>
        prev.filter((p) => p.product_id !== deleteConfirm)
      );
      setMessage({
        type: 'success',
        text: 'Sản phẩm đã được xóa',
      });
      setDeleteConfirm(null);
      setDeleteReason('');
      setTimeout(() => setMessage(null), 3000);
      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi xóa sản phẩm',
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
      sold: {
        label: 'Đã bán',
        color: 'bg-blue-100 text-blue-800',
      },
      expired: { label: 'Đã hết hạn', color: 'bg-yellow-100 text-yellow-800' },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản Lý Sản Phẩm</h1>
        <p className="text-muted-foreground mt-1">
          Xem, kiểm duyệt và xóa sản phẩm đấu giá
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <p
            className={
              message.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm hoặc người bán..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Ảnh
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Tên Sản Phẩm
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Danh Mục
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Người Bán
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Giá Hiện Tại
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-sm">
                        Trạng Thái
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-sm">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.product_id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <img
                            src={product.avatar}
                            alt={product.product_name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {product.product_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {product.category?.category_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {product.seller?.full_name}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {formatCurrency(product.current_price)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() =>
                              setDeleteConfirm(product.product_id)
                            }
                            className="p-2 hover:bg-red-50 rounded transition-colors inline-block"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {pagination.currentPage} / {pagination.totalPages}
                </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {/* Page numbers */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (pagination.totalPages <= 5) return true;
                          if (page === 1 || page === pagination.totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < pagination.totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={
                            currentPage === pagination.totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Xóa Sản Phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground font-medium">
                Bạn có chắc muốn xóa sản phẩm này?
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete_reason">Lý do xóa (bắt buộc)</Label>
                <textarea
                  id="delete_reason"
                  placeholder="Ví dụ: Vi phạm quy tắc, spam, vi phạm bản quyền..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteProduct}
                  disabled={!deleteReason.trim()}
                >
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirm(null);
                    setDeleteReason('');
                  }}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
