import React, { useState, useEffect } from 'react';
import { getSystemConfig, updateSystemConfig } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, AlertCircle } from 'lucide-react';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    triggerTime: 5,
    extendTime: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    triggerTime: 5,
    extendTime: 10,
  });

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSystemConfig();
      if (response) {
        const configData = response || {
          triggerTime: 5,
          extendTime: 10,
        };
        setConfig(configData);
        setFormData(configData);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Không thể tải cấu hình. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatePayload = {
        AUCTION_EXTEND_TRIGGER_MINUTES: formData.triggerTime,
        AUCTION_EXTEND_DURATION_MINUTES: formData.extendTime,
      };

      const response = await updateSystemConfig(updatePayload);
      if (response && response.success) {
        setConfig(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating config:', err);
      setError('Không thể cập nhật cấu hình. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(config);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cấu hình hệ thống</h1>
          <p className="text-muted-foreground mt-2">Quản lý các cấu hình đấu giá</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cấu hình hệ thống</h1>
        <p className="text-muted-foreground mt-2">Quản lý các cấu hình đấu giá</p>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Cấu hình thời gian đấu giá</h2>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-green-800">Cập nhật cấu hình thành công!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trigger Time */}
            <div className="grid gap-2">
              <label htmlFor="triggerTime" className="text-sm font-medium">
                Thời gian còn lại trước khi kết thúc đấu giá để tự động kéo dài (phút)
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Khi có người ra giá trong khoảng thời gian còn lại của phiên đấu giá ít hơn giá trị này, hệ thống sẽ tự động kéo dài đấu giá.
              </p>
              <Input
                id="triggerTime"
                type="number"
                min="0"
                value={formData.triggerTime}
                onChange={(e) => handleInputChange('triggerTime', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Giá trị hiện tại: {config.triggerTime} phút
              </p>
            </div>

            {/* Extend Duration */}
            <div className="grid gap-2">
              <label htmlFor="extendTime" className="text-sm font-medium">
                Thời gian kéo dài đấu giá (phút)
              </label>
              <Input
                id="extendTime"
                type="number"
                min="0"
                value={formData.extendTime}
                onChange={(e) => handleInputChange('extendTime', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Giá trị hiện tại: {config.extendTime} phút
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Ví dụ:</strong> Nếu có người ra giá khi thời gian còn lại ≤ {formData.triggerTime} phút, phiên đấu giá sẽ được kéo dài thêm {formData.extendTime} phút.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isSaving || JSON.stringify(formData) === JSON.stringify(config)}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Lưu cấu hình
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSaving || JSON.stringify(formData) === JSON.stringify(config)}
              >
                Hủy bỏ
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Cấu hình hiện tại</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Thời gian kích hoạt kéo dài</p>
            <p className="text-lg font-semibold">{config.triggerTime} phút</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Thời gian kéo dài</p>
            <p className="text-lg font-semibold">{config.extendTime} phút</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
