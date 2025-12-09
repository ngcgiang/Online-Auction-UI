# Hướng dẫn triển khai tính năng Danh sách Sản phẩm Đấu giá

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Product/
│   │   ├── ProductCard.jsx       # Component hiển thị từng card sản phẩm
│   │   └── ProductList.jsx       # Component danh sách sản phẩm với phân trang
│   ├── Layout/
│   └── ...
├── pages/
│   ├── Home.jsx                  # Trang chủ - tích hợp ProductList
│   └── ...
├── services/
│   ├── productService.js         # Service gọi API sản phẩm
│   └── ...
├── types/
│   └── product.ts                # Định nghĩa kiểu TypeScript cho Product
└── ...
```

## Cấu hình API

1. Tạo file `.env` tại thư mục gốc (copy từ `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8080
```

2. Hoặc sửa trực tiếp trong `src/services/productService.js` nếu không sử dụng env variables.

## Các Component

### ProductList.jsx
- Tải danh sách sản phẩm từ API
- Hỗ trợ phân trang (mặc định 12 sản phẩm/trang)
- Có xử lý loading, error state
- Tính năng scroll to top khi chuyển trang

**Props:** Không cần props

### ProductCard.jsx
- Hiển thị thông tin chi tiết của một sản phẩm
- Format giá theo VND
- Tính toán thời gian còn lại
- Hiển thị thông tin người đặt giá cao nhất
- Status badge với màu sắc khác nhau

**Props:**
- `product` (Product): Object sản phẩm từ API

## Thông tin hiển thị trên mỗi Card

1. **Ảnh sản phẩm** - Hiển thị `avatar` từ API, có fallback nếu lỗi
2. **Status Badge** - Hiển thị trạng thái (active, expired, pending, etc.)
3. **Tên sản phẩm** - Được cắt tối đa 2 dòng
4. **Giá hiện tại** - Format tiền tệ VND
5. **Người đặt giá cao nhất** - Hiển thị tên + rating score
6. **Giá mua ngay** - Hiển thị nếu có
7. **Ngày đăng** - Format DD/MM/YYYY
8. **Thời gian còn lại** - Tính toán động (ngày/giờ/phút)
9. **Số lượt ra giá** - Từ `bidCount`

## Giao diện

- **Màu sắc trung tính:** Xám, trắng, xanh lam nhạt
- **Thiết kế:** Grid responsive - 1 cột (mobile), 2 cột (tablet), 3 cột (laptop), 4 cột (desktop)
- **Hiệu ứng:** Hover effect với shadow tăng
- **Phân trang:** Thanh điều khiển phân trang dưới danh sách

## API Integration

**Endpoint:** `GET {{baseUrl}}/api/products/all`

**Query Parameters:**
- `page` (number): Số trang (mặc định 1)
- `pageSize` (number): Số sản phẩm mỗi trang (mặc định 12)

**Response Structure:**
```json
{
  "data": [ /* Array of products */ ],
  "total": 100,
  "page": 1,
  "pageSize": 12
}
```

## Sử dụng

Component ProductList được tích hợp sẵn trong `src/pages/Home.jsx`:

```jsx
import ProductList from '../components/Product/ProductList';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <ProductList />
        </div>
    );
};
```

## Chạy dự án

```bash
# Dev mode
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Dependencies

- React 19.2.0
- React Router DOM 7.10.1
- Tailwind CSS 4.1.17
- Vite 7.2.4

## Notes

- Sử dụng `Intl.NumberFormat` để format tiền tệ VND
- Xử lý error khi load ảnh với SVG fallback
- Responsive design sử dụng Tailwind CSS utilities
- Loading spinner khi đang fetch dữ liệu
- Các thông tin được xử lý safely (null coalescing, optional chaining)
