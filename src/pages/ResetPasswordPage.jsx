import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/AuthLayout";
import { Mail, Lock, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "@/services/authService";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
});

const resetSchema = z.object({
  otpCode: z.string().min(4, "OTP là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request reset
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2: Reset password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmitEmail = async (data) => {
    setIsLoading(true);
    setApiError("");
    setApiSuccess("");
    try {
      // Sử dụng API từ authService
      const res = await requestPasswordReset(data.email);
      if (res.data?.success || res.success) {
        setEmail(data.email);
        setApiSuccess("Đã gửi email xác thực. Vui lòng kiểm tra email để lấy mã OTP.");
        setStep(2);
      } else {
        setApiError(res.data?.message || res.message || "Không thể gửi email đặt lại mật khẩu.");
      }
    } catch (err) {
      setApiError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data) => {
    setIsLoading(true);
    setApiError("");
    setApiSuccess("");
    try {
      // Sử dụng API từ authService
      const res = await resetPassword(email, data.otpCode, data.newPassword);
      console.log(res);
      if (res.data?.success || res.success) {
        setApiSuccess("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
        setStep(3);
      } else {
        setApiError(res.data?.message || res.message || "Không thể đặt lại mật khẩu.");
      }
    } catch (err) {
      setApiError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {step === 1 && "Nhập email để nhận mã xác thực đặt lại mật khẩu"}
            {step === 2 && "Nhập mã OTP và mật khẩu mới"}
            {step === 3 && "Đặt lại mật khẩu thành công"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...registerEmail("email")}
                  disabled={isLoading}
                  className="h-10"
                />
                {emailErrors.email && (
                  <p className="text-xs text-destructive font-medium">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>
              {apiError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">{apiError}</p>
                </div>
              )}
              {apiSuccess && (
                <div className="p-3 rounded-md bg-green-100 border border-green-300">
                  <p className="text-xs text-green-700 font-medium">{apiSuccess}</p>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-10 font-medium">
                {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  Mã OTP
                </label>
                <Input
                  type="text"
                  placeholder="Nhập mã OTP"
                  {...registerReset("otpCode")}
                  disabled={isLoading}
                  className="h-10"
                />
                {resetErrors.otpCode && (
                  <p className="text-xs text-destructive font-medium">
                    {resetErrors.otpCode.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Mật khẩu mới
                </label>
                <Input
                  type="password"
                  placeholder="Mật khẩu mới"
                  {...registerReset("newPassword")}
                  disabled={isLoading}
                  className="h-10"
                />
                {resetErrors.newPassword && (
                  <p className="text-xs text-destructive font-medium">
                    {resetErrors.newPassword.message}
                  </p>
                )}
              </div>
              {apiError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">{apiError}</p>
                </div>
              )}
              {apiSuccess && (
                <div className="p-3 rounded-md bg-green-100 border border-green-300">
                  <p className="text-xs text-green-700 font-medium">{apiSuccess}</p>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-10 font-medium">
                {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="p-3 rounded-md bg-green-100 border border-green-300">
                <p className="text-green-700 font-medium">
                  Đặt lại mật khẩu thành công! Bạn có thể{" "}
                  <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                    đăng nhập
                  </Link>{" "}
                  với mật khẩu mới.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
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
