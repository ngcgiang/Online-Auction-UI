import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/AuthLayout";
import { Mail, Lock, User, MapPin } from "lucide-react";
import { register as registerUser } from "@/services/authService";

const registerSchema = z.object({
  full_name: z.string().min(1, "Tên đầy đủ là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
});

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Format data to match backend requirement
      const payload = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        address: data.address,
      };

      const response = await registerUser(payload);

      if (response?.success) {
        // Redirect to OTP verification with email
        navigate("/verify-otp", { state: { email: data.email } });
      } else {
        setError(response?.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Nhập thông tin của bạn để bắt đầu
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Tên đầy đủ
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                {...register("full_name")}
                disabled={isLoading}
                className="h-10"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive font-medium">
                  {errors.full_name.message}
                </p>
              )}
            </div>

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

            {/* Address Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Địa chỉ
              </label>
              <Input
                type="text"
                placeholder="123 Lò Gốm, Thành phố, Quốc gia"
                {...register("address")}
                disabled={isLoading}
                className="h-10"
              />
              {errors.address && (
                <p className="text-xs text-destructive font-medium">
                  {errors.address.message}
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
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Đăng nhập ngay
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
