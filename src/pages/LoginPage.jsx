import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/AuthLayout";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { login, loginWithGoogle } from "@/services/authService";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response?.success && response?.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store in Auth context and localStorage
        authLogin(user, accessToken, refreshToken);
        
        // Redirect to previous page or home
        const fromLocation = location.state?.from;
        if (fromLocation) {
          navigate(fromLocation, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(response?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      if (!credentialResponse.credential) {
        setError("Google login failed. Please try again.");
        return;
      }

      const response = await loginWithGoogle(credentialResponse.credential);

      if (response?.success && response?.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store in Auth context and localStorage
        authLogin(user, accessToken, refreshToken);
        toast.success("Đăng nhập bằng Google thành công!");
        
        // Redirect to previous page or home
        const fromLocation = location.state?.from;
        if (fromLocation) {
          navigate(fromLocation, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(response?.message || "Đăng nhập bằng Google thất bại");
        toast.error(response?.message || "Đăng nhập bằng Google thất bại");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Google login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
    toast.error("Google login failed. Please try again.");
  };

  return (
    <AuthLayout>
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Nhập thông tin của bạn để đăng nhập
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isLoading}
                className="h-10"
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Mật khẩu
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
                className="h-10"
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-medium"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          {/* Google Login Button */}
          <div className="w-full mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="100%"
              locale="vi_VN"
            />
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        {/* Back to Home Link */}
          <div className="mt-4 text-center text-sm">
            <Link
              to="/"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
