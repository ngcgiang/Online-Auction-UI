import React, { useState, useEffect } from 'react';
import { getCategories } from '@/services/categoryService';
import { deleteCategory, createNewCategory } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category_name: '',
  });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response && response.success) {
        // Handle both { list: [...] } and { data: [...] } structures
        const categoriesData = Array.isArray(response.data?.list) 
          ? response.data.list 
          : Array.isArray(response.data) 
          ? response.data 
          : [];
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi tải danh mục',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.category_name.trim()) {
      setMessage({
        type: 'error',
        text: 'Tên danh mục không được trống',
      });
      return;
    }

    try {
      const response = await createNewCategory({
        category_name: newCategory.category_name,
      });

      if (response && response.success) {
        setMessage({
          type: 'success',
          text: 'Danh mục đã được thêm thành công',
        });
        setNewCategory({ category_name: '' });
        setIsAddingCategory(false);
        setTimeout(() => fetchCategories(), 1000);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi thêm danh mục',
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setMessage({
        type: 'success',
        text: 'Danh mục đã được xóa',
      });
      setDeleteConfirm(null);
      setTimeout(() => fetchCategories(), 1000);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi xóa danh mục',
      });
    }
  };

  const canDeleteCategory = (category) => {
    // Can't delete if it has products
    return !category.product_count || category.product_count === 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground mt-1">
            Thêm, sửa, xóa danh mục sản phẩm
          </p>
        </div>
        <Button
          onClick={() => setIsAddingCategory(!isAddingCategory)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm Danh Mục</span>
        </Button>
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

      {/* Add Category Form */}
      {isAddingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm Danh Mục Mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Tên Danh Mục</Label>
              <Input
                id="category_name"
                placeholder="Ví dụ: Điện tử"
                value={newCategory.category_name}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    category_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCategory}>Lưu</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory({ category_name: '' });
                }}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Danh Mục</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có danh mục nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-sm">
                      ID
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-sm">
                      Tên Danh Mục
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-sm">
                      Số Sản Phẩm
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-sm">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.category_id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        #{category.category_id}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {category.category_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {category.product_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <button className="p-2 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm(category.category_id)
                          }
                          disabled={!canDeleteCategory(category)}
                          className={`p-2 rounded transition-colors ${
                            canDeleteCategory(category)
                              ? 'hover:bg-red-50 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          title={
                            !canDeleteCategory(category)
                              ? 'Không thể xóa danh mục có sản phẩm'
                              : ''
                          }
                        >
                          <Trash2
                            className={`h-4 w-4 ${
                              canDeleteCategory(category)
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Xác Nhận Xóa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Bạn có chắc muốn xóa danh mục này?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCategory(deleteConfirm)}
                >
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
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

export default CategoryManagement;
