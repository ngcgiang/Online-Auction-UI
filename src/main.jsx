import React from "react";
import ReactDOM from "react-dom/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toast } from "./components/ui/toast";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { Home } from "./pages/Home.jsx";
import { ProductDetail } from "./pages/ProductDetail.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { OTPVerificationPage } from "./pages/OTPVerificationPage.jsx";
import { UserProfilePage } from "./pages/UserProfilePage.jsx";
import { UserProfile } from "@/components/UserProfile"
import  SellerManagementPage  from "./pages/SellerManagementPage.jsx";
import  AdminManagementPage  from "./pages/AdminManagementPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UpdateUserPage } from "./pages/UpdateUserPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ChatPage from '@/pages/ChatPage';
import ResetPasswordPage  from "./pages/ResetPasswordPage.jsx";

// Load Stripe - Replace with your actual publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_example"
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/product/:productId",
    element: <ProductDetail />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-otp",
    element: <OTPVerificationPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/user-profile",
    element: <UserProfilePage />,
    children: [
      {
        path: "",
        element: <UserProfilePage />,
      },
      {
        path: "profile",
        element: <UserProfilePage />,
      },
      {
        path: "chat",
        element: <UserProfilePage />,
      },
      {
        path: "edit",
        element: <UserProfilePage />,
      },
      {
        path: "password",
        element: <UserProfilePage />,
      },
      {
        path: "watchlist",
        element: <UserProfilePage />,
      },
      {
        path: "bidded-products",
        element: <UserProfilePage />,
      },
      {
        path: "won-products",
        element: <UserProfilePage />,
      },
      {
        path: "ratings",
        element: <UserProfilePage />,
      },
    ],
  },
  {
    path: "/seller-management",
    element: <SellerManagementPage />,
    children: [
      {
        path: "",
        element: <SellerManagementPage />,
      },
      {
        path: "product-list",
        element: <SellerManagementPage />,
      },
      {
        path: "create",
        element: <SellerManagementPage />,
      },
    ],
  },
  {
    path: "/admin-management",
    element: <AdminManagementPage />,
    children: [
      {
        path: "",
        element: <AdminManagementPage />,
      },
      {
        path: "categories",
        element: <AdminManagementPage />,
      },
      {
        path: "products",
        element: <AdminManagementPage />,
      },
      {
        path: "users",
        element: <AdminManagementPage />,
      },
      {
        path: "system-config",
        element: <AdminManagementPage />,
      },
    ],
  },{
    path: "/edit-profile",
    element: <UpdateUserPage />,
  },
  {
    path: "/checkout/:productId",
    element: <CheckoutPage />,
  },
  { path: '/chat',
    element: <ChatPage /> }
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        <Elements stripe={stripePromise}>
          <RouterProvider router={router} />
        </Elements>
        <Toast />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
