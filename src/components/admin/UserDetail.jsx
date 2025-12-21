import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Edit2, Save, RotateCcw, Mail, MapPin, Cake, Star, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { updateUser } from '@/services/adminService';

const UserDetail = ({ isOpen, onClose, user, onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: user || {},
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
        address: user.address || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        role: user.role || 'bidder',
      });
    }
  }, [user, reset]);

  if (!isOpen || !user) return null;

  const handleEditClick = () => {
    setIsEditMode(true);
    setSaveMessage(null);
  };

  const handleCancelClick = () => {
    reset({
      full_name: user.full_name || '',
      email: user.email || '',
      address: user.address || '',
      dob: user.dob ? user.dob.split('T')[0] : '',
      role: user.role || 'bidder',
    });
    setIsEditMode(false);
    setSaveMessage(null);
  };

  const onSubmit = async (formData) => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      const updateData = {
        user_id: formData.user_id,
        full_name: formData.full_name,
        email: formData.email,
        address: formData.address,
        dob: formData.dob || null,
        role: formData.role,
      };
      console.log("updateData:",updateData);
      // FIX: Only pass updateData, not user.user_id as first argument
      await updateUser(updateData);

      setSaveMessage({
        type: 'success',
        text: 'Cập nhật thông tin người dùng thành công',
      });

      // Gọi callback onSave để cập nhật danh sách
      onSave({
        ...user,
        ...updateData,
      });

      setTimeout(() => {
        setIsEditMode(false);
        setSaveMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error saving user:', error);
      setSaveMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Lỗi khi cập nhật thông tin',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      seller: { label: 'Seller', color: 'bg-green-100 text-green-800' },
      bidder: { label: 'Bidder', color: 'bg-blue-100 text-blue-800' },
    };
    const config = roleMap[role] || roleMap.bidder;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getErrorMessage = (fieldName) => {
    return errors[fieldName]?.message;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 h-screen w-screen bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {isEditMode ? 'Chỉnh Sửa Thông Tin Người Dùng' : 'Chi Tiết Người Dùng'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Hidden input for user_id */}
          <input type="hidden" {...register('user_id')} value={user.user_id} />
          {/* Save Message Alert */}
          {saveMessage && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <p
                className={
                  saveMessage.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }
              >
                {saveMessage.text}
              </p>
            </div>
          )}

          {/* Profile Section */}
          <div className="flex items-center gap-6 pb-3 border-b border-slate-200">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {user.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên Đầy Đủ {isEditMode && <span className="text-red-500">*</span>}
              </label>
              {isEditMode ? (
                <div>
                  <input
                    type="text"
                    {...register('full_name', {
                      //required: 'Tên đầy đủ không được để trống',
                      minLength: {
                        value: 3,
                        message: 'Tên phải có ít nhất 3 ký tự',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Tên không được vượt quá 100 ký tự',
                      } 
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      getErrorMessage('full_name')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    disabled={isSaving}
                  />
                  {getErrorMessage('full_name') && (
                    <p className="text-red-600 text-xs mt-1">
                      {getErrorMessage('full_name')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-700">{user.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email {isEditMode && <span className="text-red-500">*</span>}
              </label>
              {isEditMode ? (
                <div>
                  <input
                    type="email"
                    {...register('email', {
                      
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ',
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      getErrorMessage('email')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    disabled={isSaving}
                  />
                  {getErrorMessage('email') && (
                    <p className="text-red-600 text-xs mt-1">
                      {getErrorMessage('email')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-700">{user.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vai Trò {isEditMode && <span className="text-red-500">*</span>}
              </label>
              {isEditMode ? (
                <div>
                  <select
                    {...register('role', {
                      required: 'Vai trò không được để trống',
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      getErrorMessage('role')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="bidder">Bidder</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  {getErrorMessage('role') && (
                    <p className="text-red-600 text-xs mt-1">
                      {getErrorMessage('role')}
                    </p>
                  )}
                </div>
              ) : (
                <div>{getRoleBadge(user.role)}</div>
              )}
            </div>

            {/* Rating Score */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Điểm Đánh Giá
              </label>
              <p className="text-slate-700">
                {typeof user.rating_score === 'number' ? `${user.rating_score}/1` : 'Chưa cập nhật'}
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa Chỉ
              </label>
              {isEditMode ? (
                <div>
                  <input
                    type="text"
                    {...register('address', {
                      maxLength: {
                        value: 255,
                        message: 'Địa chỉ không được vượt quá 255 ký tự',
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      getErrorMessage('address')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="Nhập địa chỉ"
                    disabled={isSaving}
                  />
                  {getErrorMessage('address') && (
                    <p className="text-red-600 text-xs mt-1">
                      {getErrorMessage('address')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-700">
                  {user.address || 'Chưa cập nhật'}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Cake className="h-4 w-4" />
                Ngày Sinh
              </label>
              {isEditMode ? (
                <div>
                  <input
                    type="date"
                    {...register('dob', {
                      validate: (value) => {
                        if (!value) return true;
                        const selectedDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - selectedDate.getFullYear();
                        if (age < 13) {
                          return 'Người dùng phải ít nhất 13 tuổi';
                        }
                        if (selectedDate > today) {
                          return 'Ngày sinh không được trong tương lai';
                        }
                        return true;
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      getErrorMessage('dob')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    disabled={isSaving}
                  />
                  {getErrorMessage('dob') && (
                    <p className="text-red-600 text-xs mt-1">
                      {getErrorMessage('dob')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-700">
                  {user.dob ? formatDate(user.dob) : 'Chưa cập nhật'}
                </p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-foreground">
                  Tình Trạng Xác Minh
                </span>
              </div>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  user.is_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.is_verified ? 'Đã Xác Minh' : 'Chưa Xác Minh'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-foreground">
                  Ngày Tạo Tài Khoản
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </form>

        {/* Footer / Actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={isSaving}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleEditClick}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh Sửa
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetail;
