import React, { useState, useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getCategories } from '@/services/categoryService';

const TwoLevelCategorySelector = ({ control, errors }) => {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Watch category_id value từ form
  const watchedCategoryId = useWatch({
    control,
    name: 'category_id',
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await getCategories();
        
        // FIX: Kiểm tra response.data.success thay vì response.success
        if (response.success && Array.isArray(response.data)) {
          const categoriesData = response.data;
          setCategories(categoriesData);

          // Extract parent categories (parent_id === null)
          const parents = categoriesData.filter(cat => cat.parent_id === null);
          setParentCategories(parents);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // FIX: Cập nhật child categories khi watched category_id thay đổi
  useEffect(() => {
    if (!watchedCategoryId) {
      setChildCategories([]);
      return;
    }

    // Kiểm tra nếu category_id là một parent ID
    const selectedParent = parentCategories.find(
      cat => String(cat.category_id) === String(watchedCategoryId)
    );

    if (selectedParent) {
      // Người dùng vừa chọn parent -> lọc child
      const children = categories.filter(
        cat => cat.parent_id === selectedParent.category_id
      );
      setChildCategories(children);
    } else {
      // Người dùng đã chọn child hoặc option "Sử dụng danh mục cha"
      setChildCategories([]);
    }
  }, [watchedCategoryId, categories, parentCategories]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải danh mục...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parent Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="parent_category" className="text-base font-medium">
          Danh mục cha <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="category_id"
          control={control}
          rules={{ required: 'Vui lòng chọn danh mục' }}
          render={({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger
                id="parent_category"
                className={errors.category_id ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map((cat) => (
                  <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category_id && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.category_id.message}
          </p>
        )}
      </div>

      {/* Child Category Selector */}
      {childCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="child_category" className="text-base font-medium">
            Danh mục con <span className="text-muted-foreground text-sm">(tùy chọn)</span>
          </Label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger
                  id="child_category"
                  className={errors.category_id ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Chọn danh mục con (hoặc để trống)" />
                </SelectTrigger>
                <SelectContent>
                  {/* Option to select parent category */}
                  <SelectItem value={String(watchedCategoryId)}>
                    Sử dụng danh mục cha
                  </SelectItem>
                  
                  {/* Child categories */}
                  {childCategories.map((cat) => (
                    <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category_id && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.category_id.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Chọn danh mục con hoặc giữ giá trị danh mục cha
          </p>
        </div>
      )}

      {/* Message when no child categories */}
      {watchedCategoryId && childCategories.length === 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Danh mục này không có danh mục con. Sẽ sử dụng danh mục cha được chọn.
          </p>
        </div>
      )}
    </div>
  );
};

export default TwoLevelCategorySelector;
