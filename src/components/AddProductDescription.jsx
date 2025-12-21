import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appendProductDescription } from '@/services/productService';
import { toast } from 'react-toastify';

// Quill modules configuration
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'link',
  'image',
];

// Validation Schema
const descriptionSchema = z.object({
  description: z
    .string()
    .min(1, 'Mô tả là bắt buộc')
    .min(10, 'Mô tả phải từ 10 ký tự trở lên')
    .refine(
      (val) => val.replace(/<[^>]*>/g, '').trim().length >= 10,
      'Mô tả không thể chỉ chứa khoảng trắng'
    ),
});

export default function AddProductDescription({ 
  productId, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (data) => {
    if (!productId) {
      toast.error('Product ID không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Call API to append product description
      const response = await appendProductDescription(productId, data.description);
      
      if (response.data) {
        setSuccessMessage('Mô tả sản phẩm đã được thêm thành công!');
        toast.success('Mô tả sản phẩm đã được thêm thành công!');
        
        // Reset form
        reset();

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close dialog after a short delay
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Có lỗi xảy ra khi thêm mô tả sản phẩm';
      toast.error(errorMessage);
      console.error('Error adding product description:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSuccessMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm mô tả sản phẩm</DialogTitle>
          <DialogDescription>
            Cung cấp mô tả chi tiết về sản phẩm (hỗ trợ định dạng văn bản)
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả sản phẩm</CardTitle>
              <CardDescription>
                Cung cấp mô tả chi tiết về sản phẩm (hỗ trợ định dạng văn bản)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <ReactQuill
                      value={field.value}
                      onChange={field.onChange}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      theme="snow"
                      placeholder="Nhập mô tả sản phẩm..."
                      className={`bg-white rounded-md ${
                        errors.description ? 'border border-red-500' : ''
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Đang xử lý...' : 'Thêm mô tả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
