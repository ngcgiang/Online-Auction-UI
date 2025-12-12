import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/AuthLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "@/services/authService";

export function OTPVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;
  
  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Start cooldown on mount
  useEffect(() => {
    setResendCooldown(60);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập 6 chữ số");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyEmail(email, otp);

      if (response?.success) {
        setSuccess("Xác minh thành công! Đang chuyển hướng...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(response?.message || "Mã OTP không hợp lệ");
      }
    } catch (err) {
      setError(err?.message || "Xác minh thất bại. Vui lòng thử lại.");
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await resendVerificationEmail(email);

      if (response?.success) {
        setSuccess("Mã OTP mới đã được gửi đến email của bạn");
        setResendCooldown(60);
        setOtp("");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Gửi lại mã thất bại");
      }
    } catch (err) {
      setError(err?.message || "Gửi lại mã thất bại. Vui lòng thử lại.");
      console.error("Resend error:", err);
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout>
      <Card className="border border-border/50 shadow-sm">
        {/* Back Button */}
        <div className="p-4 border-b flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/register")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <CardHeader className="space-y-2 text-center pt-6">
          <CardTitle className="text-2xl font-bold">Xác minh tài khoản</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Nhập mã 6 chữ số được gửi đến <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              disabled={isVerifying}
              maxLength="6"
              className="h-12 text-2xl text-center font-semibold tracking-widest font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              {otp.length}/6 chữ số
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying || isResending}
            className="w-full h-10 font-medium"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xác minh...
              </>
            ) : (
              "Xác minh"
            )}
          </Button>

          {/* Resend Section */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Không nhận được mã? </span>
            {resendCooldown > 0 ? (
              <span className="font-medium text-primary">
                Gửi lại trong {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending || isVerifying}
                className="font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi lại"
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
