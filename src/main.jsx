import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { Home } from "./pages/Home.jsx";
import { ProductDetail } from "./pages/ProductDetail.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { OTPVerificationPage } from "./pages/OTPVerificationPage.jsx";
import { UserProfilePage } from "./pages/UserProfilePage.jsx";
import SellerManagementPage from "./pages/SellerManagementPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

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
  }
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
