# Online Auction UI - Home Page

A modern, minimalist auction system home page built with React, Vite, and Tailwind CSS v4.

## 🚀 Tech Stack

- **Framework**: React 19 with Vite 7
- **Styling**: Tailwind CSS v4 (Latest syntax)
- **Routing**: React Router v7
- **HTTP Client**: Axios (with interceptors)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📋 Features

### 1. Header Section
- Clean minimalist logo "Auction"
- Authentication buttons (Login/Register)
- Responsive design

### 2. Top Statistics Section
Three-column layout displaying:
- **Top 5 Ending Soon**: Products with least time remaining
- **Top 5 Most Bidded**: Products with highest bid counts
- **Top 5 Highest Price**: Products with highest current prices

### 3. Filter & Search Toolbar
- Full-text search input
- Nested category dropdown
- Sort options (time, price, bids)
- Time filter for new products

### 4. Main Product Grid
- Responsive grid layout (1-4 columns based on screen size)
- Product cards with:
  - Image placeholder
  - Status badges (Sold, New)
  - Product title
  - Current price (highlighted)
  - Bidder information
  - Posted date
  - Time remaining
  - Total bid count
- Skeleton loaders during data fetch

### 5. Footer Section
- Pagination with ellipsis for large page counts
- Previous/Next navigation
- Smooth scroll to top on page change

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   ├── badge.jsx
│   │   ├── skeleton.jsx
│   │   ├── pagination.jsx
│   │   └── select.jsx
│   ├── Header.jsx             # Top navigation bar
│   ├── TopStatsSection.jsx    # Three-column stats display
│   ├── FilterToolbar.jsx      # Search and filter controls
│   └── ProductCard.jsx        # Product display card
├── pages/
│   └── Home.jsx               # Main home page
├── services/
│   └── productService.js      # API service layer
├── lib/
│   ├── axios.js               # Axios instance with interceptors
│   └── utils.js               # Utility functions (cn)
├── main.jsx                   # App entry point with routing
└── index.css                  # Global styles & CSS variables
```

## 🛠️ Setup & Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## 🎨 Design Principles

- **Minimalism**: Clean lines, ample whitespace, focus on typography
- **Color Scheme**: Monochromatic (Slate/Zinc) with deep blue accent
- **Typography**: Clear hierarchy, readable font sizes
- **Responsive**: Mobile-first approach with breakpoints
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 🔌 API Integration

### Service Layer
All API calls are abstracted in `src/services/productService.js`:

- `searchProducts(params)` - Search with filters and pagination
- `getTopLeastTimeLeft()` - Fetch ending soon products
- `getTopMostBidded()` - Fetch most bidded products
- `getTopValueProducts()` - Fetch highest price products

### Axios Configuration
- Base URL configuration
- Request interceptor for auth tokens
- Response interceptor for error handling
- Automatic token refresh on 401 errors

## 📊 State Management

- **React Hooks**: useState, useEffect for local state
- **Top Stats State**: Separate state for statistics section
- **Products State**: Main product grid data
- **Pagination State**: Current page, page size, total pages
- **Filters State**: Search keyword, category, sort, time filter

## 🎯 Key Features

### 1. Loading States
- Skeleton loaders for all data sections
- Smooth transitions between loading and loaded states

### 2. Error Handling
- Try-catch blocks for all API calls
- Fallback UI for empty states
- Console error logging

### 3. Pagination
- Dynamic page number rendering
- Ellipsis for large page counts
- Disabled states for boundary pages

### 4. Search & Filter
- Real-time filter updates
- Reset to page 1 on filter change
- Nested category support

## 🚦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## 📱 Responsive Breakpoints

- **Mobile**: 1 column (< 640px)
- **Tablet**: 2 columns (640px - 1023px)
- **Desktop**: 3 columns (1024px - 1279px)
- **Large Desktop**: 4 columns (≥ 1280px)

## 🔍 Code Quality

- **ESLint**: Configured for React best practices
- **Component Structure**: Functional components with hooks
- **Code Organization**: Clear separation of concerns
- **Naming Conventions**: Descriptive, consistent naming

## 📦 Dependencies

### Core
- react@19.2.0
- react-dom@19.2.0
- react-router@7.10.1

### Styling
- tailwindcss@4.1.17
- @tailwindcss/vite@4.1.17

### Utilities
- axios
- lucide-react
- class-variance-authority
- clsx
- tailwind-merge

## 🎓 Usage

### Starting the Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Adding New Components
1. Create component file in `src/components/`
2. Import shadcn/ui components from `@/components/ui`
3. Use utility functions from `@/lib/utils`
4. Follow existing component patterns

### API Integration
1. Add new API functions to `src/services/productService.js`
2. Use the `apiClient` instance from `@/lib/axios`
3. Handle responses consistently with existing patterns

## 🤝 Contributing

1. Follow the established code structure
2. Use TypeScript-style JSDoc comments
3. Maintain responsive design patterns
4. Test on multiple screen sizes

## 📄 License

This project is part of the Automated Auction System.

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
