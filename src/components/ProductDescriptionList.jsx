import React, { useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * ProductDescriptionList Component
 * 
 * Hiển thị danh sách mô tả sản phẩm với khả năng:
 * - Cuộn tự động đến mô tả mới nhất (bottom)
 * - Cho phép chỉnh sửa (nếu là chủ sở hữu)
 * 
 * Props:
 * - descriptions: Array của các mô tả sản phẩm
 * - isOwner: Boolean - xác định có phải là chủ sở hữu sản phẩm không
 * - onEdit: Function - callback khi bấm nút sửa mô tả
 * - formatDate: Function - hàm định dạng ngày tháng
 */
export default function ProductDescriptionList({ 
  descriptions = [], 
  isOwner = false,
  onEdit,
  formatDate 
}) {
    // 1. Tạo ref mới (hoặc đổi tên ref cũ)
    const scrollContainerRef = useRef(null);

  /**
   * Auto-scroll to bottom khi descriptions thay đổi
   * Điều này đảm bảo mô tả mới nhất (được thêm vào cuối mảng) 
   * luôn được hiển thị
   */
    useEffect(() => {
    if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        
        // Chỉ cuộn nếu nội dung dài hơn chiều cao hiển thị
        if (scrollHeight > clientHeight) {
        scrollContainerRef.current.scrollTo({
            top: scrollHeight,
            behavior: 'smooth',
        });
        }
    }
    }, [descriptions]);

  // Nếu không có mô tả, hiển thị thông báo
  if (!descriptions || descriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mô tả chi tiết sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Chưa có mô tả chi tiết
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Mô tả chi tiết sản phẩm</CardTitle>
        {/* Nút thêm/sửa mô tả - chỉ hiển thị nếu là chủ sở hữu */}
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-80 transition-opacity hover:opacity-100 text-muted-foreground hover:text-primary"
            onClick={onEdit}
            title="Thêm mô tả sản phẩm"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Thêm mô tả
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {/* Scrollable Container - Chiều cao cố định 200px với cuộn dọc */}
        <div ref={scrollContainerRef} className=" space-y-6 max-h-[200px] overflow-y-auto pr-4 custom-scrollbar">
          {descriptions.map((desc, index) => (
            <div
              key={desc.des_id || index}
              className="group flex items-start justify-between gap-4 border-l-4 border-primary/20 pl-4 transition-colors hover:border-primary/50"
            >
              {/* Nội dung mô tả */}
              <div className="flex-1 min-w-0">
                {/* HTML Content - Sử dụng prose để định dạng đẹp */}
                <div
                  className="prose prose-slate max-w-none text-foreground prose-sm prose-p:my-2 prose-headings:my-3 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: desc.description }}
                />
                {/* Thời gian cập nhật */}
                <p className="mt-3 text-xs text-muted-foreground font-medium">
                  Cập nhật: {formatDate(desc.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
