import React from 'react';
import { Loader2 } from 'lucide-react';

const SellerProductList = () => {
  const [products] = React.useState([]);
  const [isLoading] = React.useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Danh sách sản phẩm</h1>
        <p className="text-muted-foreground mt-2">Quản lý các sản phẩm đã đăng của bạn</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600 font-medium mb-2">Chưa có sản phẩm nào</p>
          <p className="text-slate-500 text-sm">Hãy bắt đầu bằng cách đăng sản phẩm đầu tiên của bạn</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Giá khởi điểm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty table body */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProductList;
