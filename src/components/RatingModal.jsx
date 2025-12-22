import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, targetUser, productId, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      rating: null,
      content: '',
    },
  });

  const selectedRating = watch('rating');

  // Fill dữ liệu vào form nếu là chế độ edit
  useEffect(() => {
    if (initialData) {
      setValue('rating', initialData.rating_point === 1 ? 'like' : 'dislike');
      setValue('content', initialData.content);
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    const submitData = {
      userId: targetUser?.id,
      productId: productId,
      ratingPoint: data.rating === 'like' ? 1 : -1,
      content: data.content,
    };
    console.log('Submitting rating data:', submitData);
    onSubmit(submitData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? 'Chỉnh sửa đánh giá' : 'Đánh giá người bán'}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* User Info */}
          <div className="text-center">
            <p className="text-sm text-slate-600">Đánh giá cho</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {targetUser?.name || 'Người dùng'}
            </p>
          </div>

          {/* Rating Selector */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">
              Đánh giá <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => setValue('rating', 'like')}
                className={`flex-1 py-4 px-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedRating === 'like'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <ThumbsUp
                  className={`h-6 w-6 ${
                    selectedRating === 'like' ? 'text-green-600' : 'text-slate-600'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedRating === 'like' ? 'text-green-600' : 'text-slate-600'
                  }`}
                >
                  Like
                </span>
              </button>

              {/* Dislike Button */}
              <button
                type="button"
                onClick={() => setValue('rating', 'dislike')}
                className={`flex-1 py-4 px-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedRating === 'dislike'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <ThumbsDown
                  className={`h-6 w-6 ${
                    selectedRating === 'dislike' ? 'text-red-600' : 'text-slate-600'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedRating === 'dislike' ? 'text-red-600' : 'text-slate-600'
                  }`}
                >
                  Dislike
                </span>
              </button>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-2">Vui lòng chọn đánh giá</p>
            )}
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register('rating', {
                required: 'Vui lòng chọn đánh giá',
              })}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Nhận xét <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content', {
                required: 'Vui lòng nhập nhận xét',
                minLength: {
                  value: 10,
                  message: 'Nhận xét phải có ít nhất 10 ký tự',
                },
              })}
              placeholder="Chia sẻ trải nghiệm của bạn với người bán này..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="4"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              {initialData ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
