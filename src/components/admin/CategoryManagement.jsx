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
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
} from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category_name: '',
    parent_id: null,
  });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response && response.success) {

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

  // Build 2-level category tree (parent + children only)
  const buildCategoryTree = () => {
    const categoryMap = {};
    const tree = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap[category.category_id] = {
        ...category,
        children: []
      };
    });

    // Second pass: build tree structure (only 2 levels)
    categories.forEach(category => {
      if (category.parent_id === null) {
        tree.push(categoryMap[category.category_id]);
      } else {
        const parent = categoryMap[category.parent_id];
        if (parent) {
          parent.children.push(categoryMap[category.category_id]);
        }
      }
    });

    // Only keep 2 levels: remove children of children
    tree.forEach(parent => {
      parent.children.forEach(child => {
        child.children = []; // Remove grandchildren
      });
    });

    return tree;
  };

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
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
      // Only send parent_id if it's not null
      const payload = {
        category_name: newCategory.category_name,
      };
      if (newCategory.parent_id !== null) {
        payload.parent_id = newCategory.parent_id;
      }

      const response = await createNewCategory(payload);

      if (response && response.success) {
        setMessage({
          type: 'success',
          text: 'Danh mục đã được thêm thành công',
        });
        setNewCategory({ category_name: '', parent_id: null });
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
    // Can't delete if it has products or has children
    const hasChildren = categories.some(cat => cat.parent_id === category.category_id);
    return (!category.product_count || category.product_count === 0) && !hasChildren;
  };

  const renderCategoryRow = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.category_id);
    const indent = level * 32;

    return (
      <React.Fragment key={category.category_id}>
        <tr className="border-b hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.category_id)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-600" />
                )
              ) : (
                <div className="h-4 w-4 rounded bg-muted" />
              )}
              <span className="text-sm text-muted-foreground">
                #{category.category_id}
              </span>
            </div>
          </td>
          <td className="px-4 py-3">
            <span className={`text-sm font-medium ${level === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {category.category_name}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">
            {category.product_count || 0}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-2">
              {level === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewCategory({
                      category_name: '',
                      parent_id: category.category_id,
                    });
                    setIsAddingCategory(true);
                  }}
                  className="h-8 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">Thêm con</span>
                </Button>
              )}
              <button className="p-2 hover:bg-blue-50 rounded transition-colors">
                <Edit2 className="h-4 w-4 text-blue-600" />
              </button>
              <button
                onClick={() => setDeleteConfirm(category.category_id)}
                disabled={!canDeleteCategory(category)}
                className={`p-2 rounded transition-colors ${
                  canDeleteCategory(category)
                    ? 'hover:bg-red-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title={
                  !canDeleteCategory(category)
                    ? 'Không thể xóa danh mục có sản phẩm hoặc danh mục con'
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
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && category.children.map(child => 
          renderCategoryRow(child, level + 1)
        )}
      </React.Fragment>
    );
  };

  const categoryTree = buildCategoryTree();
  const parentCategories = categories.filter(cat => cat.parent_id === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh mục và danh mục con
          </p>
        </div>
        <Button
          onClick={() => {
            setNewCategory({ category_name: '', parent_id: null });
            setIsAddingCategory(!isAddingCategory);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm Danh Mục Chính</span>
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
            <CardTitle>
              {newCategory.parent_id 
                ? `Thêm Danh Mục Con cho "${categories.find(c => c.category_id === newCategory.parent_id)?.category_name}"`
                : 'Thêm Danh Mục Chính'
              }
            </CardTitle>
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
            {newCategory.parent_id === null && (
              <div className="space-y-2">
                <Label htmlFor="parent_category">Danh Mục Cha (Tùy chọn)</Label>
                <select
                  id="parent_category"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={newCategory.parent_id || ''}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      parent_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                >
                  <option value="">-- Không có (Danh mục chính) --</option>
                  {parentCategories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAddCategory}>Lưu</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory({ category_name: '', parent_id: null });
                }}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Tree Table */}
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
                    <th className="text-left px-4 py-3 font-medium text-sm w-1/4">
                      ID & Cấu Trúc
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-sm w-1/3">
                      Tên Danh Mục
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-sm w-1/6">
                      Số Sản Phẩm
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-sm w-1/4">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTree.map(category => renderCategoryRow(category))}
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
                Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.
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