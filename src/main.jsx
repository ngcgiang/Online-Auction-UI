import React from "react";
import ReactDOM from "react-dom/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
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
import  SellerManagementPage  from "./pages/SellerManagementPage.jsx";
import  AdminManagementPage  from "./pages/AdminManagementPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UpdateUserPage } from "./pages/UpdateUserPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ChatPage from '@/pages/ChatPage';

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
    path: "/user-profile",
    element: <UserProfilePage />,
  },
  {
    path: "/seller-management",
    element: <SellerManagementPage />,
  },
  {
    path: "/admin-management",
    element: <AdminManagementPage />,
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
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <RouterProvider router={router} />
      </Elements>
      <Toast />
    </AuthProvider>
  </React.StrictMode>,
);
