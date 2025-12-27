Collecting workspace information# Online Auction System - Frontend UI

A modern, production-ready auction platform frontend built with **React 19**, **Vite 7**, and **Tailwind CSS v4**.

## 🎯 Project Overview

This is the frontend UI for an automated online auction system that enables users to:
- **Browse & Search** products with advanced filtering
- **Place Bids** in real-time auctions
- **Manage Profiles** as buyers or sellers
- **Create Auctions** (seller feature)
- **Admin Dashboard** for system management
- **Q&A System** for buyer-seller communication

## ✨ Key Features

### 🛍️ For Buyers
- Real-time product search with filters (category, price, time)
- Advanced bid placement with smart suggestions
- Product detail views with auction history
- Seller ratings and reviews
- Q&A section for product inquiries
- User profile management

### 🏪 For Sellers
- Create and manage auction products
- Set starting prices, bid increments, and buy-now prices
- Upload product images (multi-image support)
- Track bidding history
- Manage seller account and ratings

### 👨‍💼 For Admins
- Dashboard with revenue and user analytics
- Manage seller upgrade requests
- Monitor system metrics
- User management

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **HTTP** | Axios with interceptors |
| **UI Components** | shadcn/ui |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **State** | React Context API |
| **Real-time** | Socket.io |
| **Rich Text** | React Quill |

## 📁 Project Structure

````
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── Header.jsx             # Navigation bar
│   ├── TopStatsSection.jsx    # Featured products
│   ├── FilterToolbar.jsx      # Search & filters
│   ├── ProductCard.jsx        # Product display
│   ├── BidInput.jsx           # Bidding component
│   ├── CreateAuctionProduct.jsx  # Seller product creation
│   ├── UserProfile.jsx        # User profile display
│   └── admin/                 # Admin components
├── pages/
│   ├── Home.jsx               # Home page
│   ├── ProductDetail.jsx      # Product detail page
│   ├── LoginPage.jsx          # Login
│   ├── RegisterPage.jsx       # Registration
│   ├── UserProfilePage.jsx    # User profile
│   ├── UpdateUserPage.jsx     # Edit profile
│   ├── SellerManagementPage.jsx
│   └── AdminManagementPage.jsx
├── services/
│   ├── productService.js      # Product API calls
│   ├── authService.js         # Authentication
│   ├── userService.js         # User management
│   ├── qaService.js           # Q&A system
│   └── adminService.js        # Admin operations
├── context/
│   └── AuthContext.jsx        # Authentication context
├── hooks/
│   └── useProductSocket.js    # WebSocket for real-time bids
├── lib/
│   ├── axios.js               # HTTP client config
│   ├── socket.js              # Socket.io utilities
│   └── utils.js               # Helper functions
├── assets/                    # Images, fonts
├── main.jsx                   # App entry point
└── index.css                  # Global styles
````

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Online-Auction-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit .env:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   VITE_STRIPE_PUBLISHABLE_KEY=your_key
   VITE_GOOGLE_CLIENT_ID=your_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

## 📋 Available Scripts

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🎨 Design System

### Color Palette
- **Background**: White (light mode)
- **Primary**: Deep Blue (`hsl(221 83% 53%)`)
- **Accent**: Slate Gray
- **Status**: Green (success), Red (error), Yellow (warning)

### Responsive Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1023px (2 columns)
- **Desktop**: 1024px - 1279px (3 columns)
- **Large**: ≥ 1280px (4 columns)

## 🔌 API Integration

### Base URL
Configure in .env:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products/search` | GET | Search products |
| `/api/products/top-least-time-left` | GET | Ending soon products |
| `/api/products/top-most-bidded` | GET | Most bidded products |
| `/api/products/:id` | GET | Product details |
| `/api/bids` | POST | Place a bid |
| `/api/users/profile` | GET | User profile |
| `/api/auth/login` | POST | Login |
| `/api/auth/register` | POST | Register |

See API_INTEGRATION.md for complete documentation.

## 🔐 Authentication

- **Method**: JWT tokens
- **Storage**: localStorage
- **Token Refresh**: Automatic on 401 response
- **OAuth**: Google OAuth support
- **Email Verification**: OTP-based

## 🔄 State Management

Uses **React Context API** for:
- Authentication state
- User profile data
- Global notifications

Local component state for:
- Form data
- UI states
- Pagination

## 📡 Real-time Features

Socket.io connection for:
- Live bid updates
- Price changes
- Auction countdown
- Notifications

## 🧪 Testing

Test API integration locally:
```bash
npm run dev
# Make requests to http://localhost:5173
```

See API_INTEGRATION.md for request examples.

## 📦 Key Dependencies

```json
{
  "react": "^19.2.0",
  "react-router": "^7.10.1",
  "axios": "^1.6.0",
  "tailwindcss": "^4.1.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "socket.io-client": "^4.7.0",
  "react-quill-new": "^10.0.0",
  "lucide-react": "^0.344.0",
  "@radix-ui/react-*": "latest"
}
```

## 📚 Documentation

- API Integration Guide
- Implementation Details
- Project Summary
- Payment Setup
- Chat Integration
- Google OAuth Setup

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
```bash
# Vercel
vercel

# Netlify
netlify deploy
```

### Environment Variables (Production)
Update .env with production URLs:
```env
VITE_API_BASE_URL=https://api.yourserver.com
VITE_SOCKET_URL=https://api.yourserver.com
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 Code Standards

- **Component Structure**: Functional components with hooks
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Styling**: Tailwind classes, avoid inline styles
- **Error Handling**: Try-catch blocks, user-friendly messages

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend has CORS enabled
- Check `VITE_API_BASE_URL` matches backend URL

### Socket Connection Failed
- Verify WebSocket URL in .env
- Check backend Socket.io server is running

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

For issues and questions:
1. Check existing documentation
2. Review API_INTEGRATION.md
3. Check browser console for errors
4. Contact development team

## 📄 License

This project is proprietary software for the Automated Auction System.

---

**Built with ❤️ using React, Vite, and Tailwind CSS**