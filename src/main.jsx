import React from "react";
import ReactDOM from "react-dom/client";
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
  }
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toast />
    </AuthProvider>
  </React.StrictMode>,
);
