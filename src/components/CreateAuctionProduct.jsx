import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from "@/context/AuthContext"
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  ImagePlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TwoLevelCategorySelector from '@/components/TwoLevelCategorySelector';
import { createProduct } from '@/services/productService';

// Validation Schema
const createAuctionProductSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc')
    .min(5, 'Tên sản phẩm phải từ 5 ký tự trở lên')
    .max(200, 'Tên sản phẩm không được vượt quá 200 ký tự'),
  category_id: z
    .string()
    .min(1, 'Vui lòng chọn danh mục'),
  start_value: z
    .string()
    .min(1, 'Giá khởi điểm là bắt buộc')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Giá khởi điểm phải là số dương'
    ),
  price_step: z
    .string()
    .min(1, 'Bước giá là bắt buộc')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Bước giá phải là số dương'
    ),
  buy_now_value: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      'Giá mua ngay phải là số dương'
    )
    .refine(
      () => true,
      'Giá mua ngay phải lớn hơn giá khởi điểm'
    ),
  description: z
    .string()
    .min(10, 'Mô tả sản phẩm phải từ 10 ký tự trở lên')
    .max(5000, 'Mô tả sản phẩm không được vượt quá 5000 ký tự'),
  end_time: z
    .string()
    .min(1, 'Thời gian kết thúc là bắt buộc')
    .refine(
      (val) => {
        const selectedTime = new Date(val).getTime();
        const currentTime = new Date().getTime();
        return selectedTime > currentTime;
      },
      'Thời gian kết thúc phải là trong tương lai'
    ),
  permission: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // Validate buy_now_value > start_value
  if (data.buy_now_value && Number(data.buy_now_value) <= Number(data.start_value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['buy_now_value'],
      message: 'Giá mua ngay phải lớn hơn giá khởi điểm',
    });
  }
});



// Format currency display
const formatCurrency = (value) => {
  if (!value || isNaN(Number(value))) return '';
  return Number(value).toLocaleString('vi-VN') + ' VNĐ';
};

// Quill modules
const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'list', 'bullet',
  'link', 'image',
];

const CreateAuctionProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createAuctionProductSchema),
    mode: 'onBlur',
    defaultValues: {
      product_name: '',
      category_id: '',
      start_value: '',
      price_step: '',
      buy_now_value: '',
      description: '',
      end_time: '',
      permission: true,
    },
  });

  const watchStartValue = watch('start_value');
  const watchPriceStep = watch('price_step');
  const watchBuyNowValue = watch('buy_now_value');

  // Handle image selection with validation
  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    
    // Clear previous message
    setSubmitMessage(null);

    // Validate file count
    if (selectedImages.length + files.length > 10) {
      setSubmitMessage({
        type: 'error',
        text: 'Tối đa 10 ảnh. Bạn đã chọn ' + selectedImages.length + ' ảnh.',
      });
      return;
    }

    // Validate file type and size
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name} - Định dạng không được hỗ trợ (chỉ JPEG, PNG, GIF, WebP)`);
        return;
      }

      // Check file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        errors.push(`${file.name} - Kích thước vượt quá 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Show validation errors if any
    if (errors.length > 0) {
      setSubmitMessage({
        type: 'error',
        text: 'Lỗi tệp:\n' + errors.join('\n'),
      });
      return;
    }

    // Create previews for valid files
    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, [selectedImages]);

  // Remove image from selection
  const removeImage = useCallback((index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Cleanup old preview URL
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newPreviews;
    });
  }, []);

  // Handle form submission
  const onSubmit = async (formData) => {
    // Validate minimum 3 images
    if (selectedImages.length < 3) {
      setSubmitMessage({
        type: 'error',
        text: 'Vui lòng chọn tối thiểu 3 ảnh',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Create FormData
      const submitData = new FormData();

      // Append text fields
      submitData.append('product_name', formData.product_name);
      submitData.append('category_id', formData.category_id);
      submitData.append('start_price', Number(formData.start_value));
      submitData.append('step_price', Number(formData.price_step));
      if (formData.buy_now_value) {
        submitData.append('buy_now_price', Number(formData.buy_now_value));
      }
      submitData.append('description', formData.description);
      submitData.append('end_time', formData.end_time);
      submitData.append('allow_new_users', formData.permission);

      // Append hidden fields
      submitData.append('start_time', new Date().toISOString());
      submitData.append('seller_id', user.user_id); // TODO: Replace with actual seller_id from auth
      submitData.append('status', 'active');

      // Append images
      selectedImages.forEach((file) => {
        console.log('Appending image file:', file);
        submitData.append('images', file);
      });
console.log('Nội dung FormData:', Array.from(submitData.entries()));      // Make API request using product service
      const response = await createProduct(submitData);
      console.log('Create product response:', response);

      // Check if response is successful
      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: response.message || 'Sản phẩm đấu giá được tạo thành công! Đang chuyển hướng...',
        });

        // Reset form and images after 1.5 seconds
        setTimeout(() => {
          reset();
          setSelectedImages([]);
          setImagePreviews([]);
          // TODO: Navigate to seller management page or product detail page
          navigate(`/product/${response.data.product_id}`);
        }, 1500);
      } else {
        setSubmitMessage({
          type: 'error',
          text: response.message || 'Có lỗi khi tạo sản phẩm',
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Extract error message from API response
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Có lỗi khi tạo sản phẩm. Vui lòng thử lại.';
      
      setSubmitMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Đăng Bán Sản Phẩm Đấu Giá
          </h1>
          <p className="text-muted-foreground">
            Tạo một sản phẩm đấu giá mới để bán trên nền tảng
          </p>
        </div>

        {/* Status Messages */}
        {submitMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              submitMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {submitMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p
              className={
                submitMessage.type === 'success'
                  ? 'text-emerald-800'
                  : 'text-red-800'
              }
            >
              {submitMessage.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Nhập tên sản phẩm và chọn danh mục
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product_name" className="text-base font-medium">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_name"
                  placeholder="Ví dụ: iPhone 15 Pro Max - Màu đen"
                  {...register('product_name')}
                  className={errors.product_name ? 'border-red-500' : ''}
                />
                {errors.product_name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.product_name.message}
                  </p>
                )}
              </div>

          {/* Category */}
          <TwoLevelCategorySelector
            control={control}
            errors={errors}
          />
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt giá bán</CardTitle>
              <CardDescription>
                Xác định giá khởi điểm, bước giá và giá mua ngay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Start Value */}
              <div className="space-y-2">
                <Label htmlFor="start_value" className="text-base font-medium">
                  Giá khởi điểm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_value"
                  type="number"
                  placeholder="Ví dụ: 1000000"
                  {...register('start_value')}
                  className={errors.start_value ? 'border-red-500' : ''}
                />
                {watchStartValue && !errors.start_value && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(watchStartValue)}
                  </p>
                )}
                {errors.start_value && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.start_value.message}
                  </p>
                )}
              </div>

              {/* Price Step */}
              <div className="space-y-2">
                <Label htmlFor="price_step" className="text-base font-medium">
                  Bước giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price_step"
                  type="number"
                  placeholder="Ví dụ: 50000"
                  {...register('price_step')}
                  className={errors.price_step ? 'border-red-500' : ''}
                />
                {watchPriceStep && !errors.price_step && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(watchPriceStep)}
                  </p>
                )}
                {errors.price_step && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.price_step.message}
                  </p>
                )}
              </div>

              {/* Buy Now Value */}
              <div className="space-y-2">
                <Label
                  htmlFor="buy_now_value"
                  className="text-base font-medium"
                >
                  Giá mua ngay (tùy chọn)
                </Label>
                <Input
                  id="buy_now_value"
                  type="number"
                  placeholder="Ví dụ: 5000000"
                  {...register('buy_now_value')}
                  className={
                    errors.buy_now_value
                      ? 'border-red-500'
                      : ''
                  }
                />
                {watchBuyNowValue && !errors.buy_now_value && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(watchBuyNowValue)}
                  </p>
                )}
                {errors.buy_now_value && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.buy_now_value.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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

          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh sản phẩm</CardTitle>
              <CardDescription>
                Tải lên tối thiểu 3 ảnh (tối đa 10 ảnh, mỗi ảnh ≤ 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Input */}
              <div className="space-y-2">
                <label
                  htmlFor="images"
                  className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-3">
                    <ImagePlus className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-base font-medium text-foreground">
                        Nhấp để chọn ảnh hoặc kéo thả
                      </p>
                      <p className="text-sm text-muted-foreground">
                        JPEG, PNG, GIF, WebP (Mỗi ảnh tối đa 5MB)
                      </p>
                    </div>
                  </div>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Count Indicator */}
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium">
                  {selectedImages.length} ảnh được chọn
                </span>
                <span
                  className={`text-sm font-medium ${
                    selectedImages.length >= 3
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {selectedImages.length >= 3 ? '✓ Đủ' : `Cần ${3 - selectedImages.length} ảnh`}
                </span>
              </div>

              {/* Validation Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Yêu cầu:</strong> Chọn 3-10 ảnh, định dạng JPEG/PNG/GIF/WebP, mỗi ảnh tối đa 5MB
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((item, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden bg-muted aspect-square"
                    >
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duration & Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Thời gian & Cài đặt</CardTitle>
              <CardDescription>
                Xác định thời gian kết thúc đấu giá và quyền riêng tư
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-base font-medium">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="end_time"
                    type="datetime-local"
                    {...register('end_time')}
                    className={`pl-10 ${
                      errors.end_time ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.end_time && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.end_time.message}
                  </p>
                )}
              </div>

              {/* Permission Toggle */}
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  {/* Phần hiển thị icon và text giữ nguyên */}
                  {watch('permission') ? (
                    <Eye className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {watch('permission') ? 'Công khai' : 'Hạn chế'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {watch('permission')
                        ? 'Cho phép tất cả mọi người tham gia ra giá'
                        : 'Chỉ cho phép người dùng có điểm đánh giá trên 80%'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentValue = watch('permission');
                    // Sử dụng setValue để cập nhật giá trị
                    setValue('permission', !currentValue, { 
                      shouldValidate: true, // Kiểm tra lỗi ngay lập tức (nếu có validate)
                      shouldDirty: true     // Đánh dấu form đã bị thay đổi
                    });
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    watch('permission')
                      ? 'bg-emerald-600'
                      : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${
                      watch('permission') ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                
                {/* QUAN TRỌNG: Cần một input ẩn để đăng ký field này vào form nếu chưa dùng Controller */}
                <input type="hidden" {...register('permission')} />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Tạo Sản Phẩm Đấu Giá
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                reset();
                setSelectedImages([]);
                setImagePreviews([]);
                setSubmitMessage(null);
              }}
              disabled={isSubmitting}
            >
              Xóa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionProduct;
