# API Integration Guide

This document provides detailed information on how the Home page integrates with the backend API.

---

## 🔌 API Endpoints Used

### 1. Search Products
**Endpoint**: `GET /api/products/search`

**Purpose**: Main product listing with filters and pagination

**Query Parameters**:
```javascript
{
  keyword: "iPhone",        // Search term
  category: 5,              // Category ID
  page: 1,                  // Current page (default: 1)
  pageSize: 12,             // Items per page (default: 12)
  sortBy: "time",           // Sort: time|price|bid (default: time)
  newMinutes: 60            // Minutes for "new" badge (default: 60)
}
```

**Response**:
```javascript
{
  success: true,
  message: "Products retrieved successfully",
  data: [
    {
      product_id: 101,
      product_name: "iPhone 15 Pro Max",
      current_price: 25000000,
      start_price: 20000000,
      buy_now_price: 30000000,
      start_time: "2025-01-01T10:00:00Z",
      end_time: "2025-01-15T10:00:00Z",
      category_id: 5,
      seller_id: 42,
      winner_id: null,
      status: "active",
      bid_count: 15,
      is_new: true,
      created_at: "2025-01-01T09:00:00Z",
      updated_at: "2025-01-10T15:30:00Z"
    }
    // ... more products
  ],
  searchCriteria: {
    keyword: "iPhone",
    category: 5,
    sortBy: "time",
    newMinutes: 60
  },
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalPages: 5,
    totalItems: 58
  }
}
```

**Usage in Code**:
```javascript
import { searchProducts } from '@/services/productService';

const response = await searchProducts({
  keyword: "iPhone",
  category: 5,
  page: 1,
  pageSize: 12,
  sortBy: "price",
  newMinutes: 120
});
```

---

### 2. Top Products - Ending Soon
**Endpoint**: `GET /api/products/top-least-time-left`

**Purpose**: Get products with least time remaining (for Top Stats section)

**Response**:
```javascript
[
  {
    product_id: 205,
    product_name: "MacBook Pro 16-inch",
    current_price: 45000000,
    end_time: "2025-01-11T14:30:00Z",
    bid_count: 28,
    // ... other fields
  }
  // ... up to 5 products
]
```

**Usage**:
```javascript
import { getTopLeastTimeLeft } from '@/services/productService';

const endingSoon = await getTopLeastTimeLeft();
```

---

### 3. Top Products - Most Bidded
**Endpoint**: `GET /api/products/top-most-bidded`

**Purpose**: Get products with highest bid counts

**Response**:
```javascript
[
  {
    product_id: 150,
    product_name: "Samsung Galaxy S24 Ultra",
    current_price: 22000000,
    bid_count: 45,
    // ... other fields
  }
  // ... up to 5 products
]
```

**Usage**:
```javascript
import { getTopMostBidded } from '@/services/productService';

const mostBidded = await getTopMostBidded();
```

---

### 4. Top Products - Highest Price
**Endpoint**: `GET /api/products/top-value`

**Purpose**: Get products with highest current prices

**Response**:
```javascript
[
  {
    product_id: 189,
    product_name: "Tesla Model 3",
    current_price: 950000000,
    // ... other fields
  }
  // ... up to 5 products
]
```

**Usage**:
```javascript
import { getTopValueProducts } from '@/services/productService';

const highestPrice = await getTopValueProducts();
```

---

## 🛠️ Service Layer Architecture

### Axios Instance (`src/lib/axios.js`)

#### Configuration
```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Request Interceptor
Automatically adds auth token to all requests:
```javascript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

#### Response Interceptor
Handles errors globally:
```javascript
apiClient.interceptors.response.use(
  (response) => response.data,  // Return data directly
  (error) => {
    // Handle 401, 403, 404, 500, etc.
    // Automatic logout on 401
    // User-friendly error messages
  }
);
```

---

## 📊 Data Flow

### 1. Initial Page Load

```
┌─────────────┐
│  Home.jsx   │
└──────┬──────┘
       │ useEffect (mount)
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌──────────────┐
│ fetchTopStats│      │fetchProducts │
└──────┬──────┘      └──────┬───────┘
       │                     │
       ├── Promise.all       │
       │   ├─ getTopLeastTimeLeft()
       │   ├─ getTopMostBidded()
       │   └─ getTopValueProducts()
       │                     │
       │                     └─ searchProducts(params)
       ▼                     ▼
   [setState]            [setState]
```

### 2. Filter Change

```
┌──────────────┐
│ User changes │
│   filter     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│handleFilter  │
│  Change      │
└──────┬───────┘
       │ setFilters()
       │ setPagination(page: 1)
       │
       ▼
   useEffect triggers
       │
       ▼
┌──────────────┐
│searchProducts│
│  (new params)│
└──────┬───────┘
       │
       ▼
   Update products
```

### 3. Pagination

```
┌──────────────┐
│ User clicks  │
│ page number  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│handlePage    │
│  Change      │
└──────┬───────┘
       │ setPagination(newPage)
       │ scrollToTop()
       │
       ▼
   useEffect triggers
       │
       ▼
┌──────────────┐
│searchProducts│
│(same filters,│
│  new page)   │
└──────────────┘
```

---

## 🔐 Authentication Flow

### Setting Auth Token
```javascript
// After successful login
localStorage.setItem('auth_token', 'your-jwt-token');
```

### Automatic Token Injection
```javascript
// All subsequent API calls include:
headers: {
  'Authorization': 'Bearer your-jwt-token'
}
```

### Handling Expired Tokens
```javascript
// On 401 response:
// 1. Clear local storage
localStorage.removeItem('auth_token');
// 2. Redirect to login
window.location.href = '/login';
```

---

## 🎯 Request/Response Examples

### Example 1: Search with Keyword
**Request**:
```bash
GET /api/products/search?keyword=iPhone&page=1&pageSize=12&sortBy=price
```

**Response** (shortened):
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "product_id": 101,
      "product_name": "iPhone 15 Pro Max 256GB",
      "current_price": 25000000,
      "end_time": "2025-01-20T10:00:00Z",
      "bid_count": 12,
      "is_new": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 12,
    "totalPages": 3,
    "totalItems": 28
  }
}
```

### Example 2: Filter by Category
**Request**:
```bash
GET /api/products/search?category=5&page=1&pageSize=12&sortBy=time
```

**Response**: Same structure as above, filtered by category

### Example 3: Get Top Stats
**Request**:
```bash
GET /api/products/top-least-time-left
```

**Response**:
```json
[
  {
    "product_id": 205,
    "product_name": "MacBook Pro 16-inch M3",
    "current_price": 45000000,
    "end_time": "2025-01-11T14:30:00Z",
    "bid_count": 28
  },
  // ... 4 more products
]
```

---

## 🛡️ Error Handling

### Network Errors
```javascript
try {
  const response = await searchProducts(params);
} catch (error) {
  // error.message = "Network error. Please check your connection."
  console.error("Error:", error);
  setProducts([]);
}
```

### API Errors (4xx, 5xx)
```javascript
// Handled by axios interceptor
// Error object structure:
{
  success: false,
  message: "Category not found",
  error: "NOT_FOUND"
}
```

### Timeout Errors
```javascript
// After 10 seconds (configured in axios instance)
{
  message: "Request timeout. Please try again."
}
```

---

## 📝 Data Transformation

### Product Data Mapping
The `formatProductData` utility transforms API responses:

**API Response**:
```javascript
{
  product_id: 101,
  product_name: "iPhone 15",
  current_price: 25000000,
  // snake_case fields
}
```

**Transformed Data** (optional, if needed):
```javascript
{
  id: 101,
  name: "iPhone 15",
  currentPrice: 25000000,
  // camelCase fields
}
```

### Price Formatting
```javascript
import { formatPrice } from '@/services/productService';

formatPrice(25000000)
// Output: "₫25,000,000"
```

### Time Calculation
```javascript
import { calculateTimeRemaining } from '@/services/productService';

calculateTimeRemaining("2025-01-15T10:00:00Z")
// Output: { text: "4 ngày 5 giờ", isEnded: false }
```

---

## 🔄 State Management

### Component State Structure

```javascript
// Top Stats State
const [topStats, setTopStats] = useState({
  endingSoon: [],      // Array of products
  mostBidded: [],      // Array of products
  highestPrice: [],    // Array of products
});

// Products State
const [products, setProducts] = useState([]);

// Loading States
const [statsLoading, setStatsLoading] = useState(true);
const [productsLoading, setProductsLoading] = useState(true);

// Pagination State
const [pagination, setPagination] = useState({
  currentPage: 1,
  pageSize: 12,
  totalPages: 1,
  totalItems: 0,
});

// Filter State
const [filters, setFilters] = useState({
  keyword: "",
  category: "",
  sortBy: "time",
  newMinutes: 60,
});
```

---

## 🚀 Performance Optimizations

### 1. Parallel API Calls
```javascript
// Fetch all top stats simultaneously
const [endingSoon, mostBidded, highestPrice] = await Promise.all([
  getTopLeastTimeLeft(),
  getTopMostBidded(),
  getTopValueProducts(),
]);
```

### 2. Debounced Search
```javascript
// Reset to page 1 on filter change (prevents invalid page numbers)
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  setPagination(prev => ({ ...prev, currentPage: 1 }));
};
```

### 3. Conditional Rendering
```javascript
// Only show pagination if there are multiple pages
{!productsLoading && products.length > 0 && pagination.totalPages > 1 && (
  <Pagination>...</Pagination>
)}
```

---

## 🧪 Testing API Integration

### Using Mock Data
Replace axios calls with mock data for testing:

```javascript
// src/services/productService.js (development)
export const searchProducts = async (params) => {
  // return apiClient.get(...);  // Comment out
  
  // Mock response
  return {
    success: true,
    data: [
      {
        product_id: 1,
        product_name: "Test Product",
        current_price: 100000,
        // ... more fields
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 1
    }
  };
};
```

### Testing with Postman/curl
```bash
# Test search endpoint
curl "http://localhost:3000/api/products/search?keyword=iPhone&page=1&pageSize=12"

# Test top products
curl "http://localhost:3000/api/products/top-least-time-left"
```

---

## 📚 Additional API Endpoints (Available but not used in Home)

### Get Product by ID
```javascript
import { getProductById } from '@/services/productService';

const product = await getProductById(101);
```

### Get Product Details
```javascript
import { getProductDetails } from '@/services/productService';

const details = await getProductDetails(101);
// Returns: seller info, winner info, images, description history
```

### Create Product (Seller only)
```javascript
import { createProduct } from '@/services/productService';

const newProduct = await createProduct({
  product_name: "iPhone 15 Pro",
  start_price: 20000000,
  buy_now_price: 30000000,
  category_id: 5,
  start_time: "2025-01-01T10:00:00Z",
  end_time: "2025-01-15T10:00:00Z"
});
```

---

## 🔧 Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.auction.com
```

### Production
```env
VITE_API_BASE_URL=https://api.auction.com
```

---

## 📊 API Response Handling

### Success Response Pattern
```javascript
{
  success: true,
  message: "Operation successful",
  data: [...] or {...}
}
```

### Error Response Pattern
```javascript
{
  success: false,
  message: "Error description",
  error: "ERROR_CODE"
}
```

### Empty Results
```javascript
{
  success: true,
  message: "No products found",
  data: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  }
}
```

---

## 🎯 Integration Checklist

- [x] Axios instance configured with base URL
- [x] Request interceptor for auth tokens
- [x] Response interceptor for error handling
- [x] All required endpoints implemented
- [x] Error handling in all API calls
- [x] Loading states for all API calls
- [x] Data transformation utilities
- [x] Environment variable configuration
- [x] Mock data capability for testing

---

**Ready for Backend Integration** ✅

Once your backend API is deployed:
1. Update `VITE_API_BASE_URL` in `.env`
2. Ensure API endpoints match the documentation
3. Test authentication flow
4. Verify CORS configuration on backend
5. Test all features with real data
