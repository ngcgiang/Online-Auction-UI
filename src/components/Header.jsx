import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { requestUserUpgrade } from "@/services/userService";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Helper function to determine upgrade button state
  const getUpgradeButtonState = () => {
    // Admin role doesn't show upgrade button
    if (user.role === "admin") {
      return null;
    }

    const isExpiredSeller = user.role === "seller" && new Date() - new Date(user.upgrade_at) > ONE_WEEK_MS;
    const isPending = user.upgrade_request === true;
    const isActiveSeller = user.role === "seller" && !isExpiredSeller;

    // Determine state based on user conditions
    if (isPending) {
      return {
        type: "pending",
        label: "Yêu cầu đang chờ xử lý",
        shortLabel: "Đang chờ",
      };
    }

    if (isActiveSeller) {
      return {
        type: "active",
        label: "Seller (Đang hoạt động)",
        shortLabel: "Seller",
      };
    }

    if (user.role === "bidder" || isExpiredSeller) {
      return {
        type: "action",
        label: user.role === "bidder" ? "Yêu cầu nâng cấp Seller" : "Seller (Hết hạn) - Gia hạn",
        shortLabel: user.role === "bidder" ? "Nâng cấp" : "Gia hạn",
      };
    }

    return null;
  };

  // Handle upgrade request with loading state and feedback
  const handleUpgradeRequest = async () => {
    setIsUpgrading(true);
    setFeedbackMessage(null);

    try {
      await requestUserUpgrade();
      setFeedbackMessage({
        type: "success",
        text: user.role === "bidder" 
          ? "Yêu cầu nâng cấp đã được gửi!" 
          : "Yêu cầu gia hạn đã được gửi!",
      });
      // Auto-clear message after 3 seconds
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // Render upgrade button based on state
  const renderUpgradeButton = () => {
    const buttonState = getUpgradeButtonState();
    if (!buttonState) return null;

    if (buttonState.type === "pending") {
      return (
        <Button
          variant="outline"
          className="gap-2 border-yellow-500 text-yellow-500 cursor-default"
          disabled
        >
          <span className="hidden sm:inline">{buttonState.label}</span>
          <span className="sm:hidden">{buttonState.shortLabel}</span>
        </Button>
      );
    }

    if (buttonState.type === "active") {
      return (
        <Button
          variant="outline"
          className="gap-2 border-green-500 text-green-500 cursor-default"
          disabled
        >
          <span className="hidden sm:inline">{buttonState.label}</span>
          <span className="sm:hidden">{buttonState.shortLabel}</span>
        </Button>
      );
    }

    if (buttonState.type === "action") {
      return (
        <Button
          variant="outline"
          onClick={handleUpgradeRequest}
          disabled={isUpgrading}
          className="gap-2 border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-70"
        >
          {isUpgrading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Đang xử lý...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{buttonState.label}</span>
              <span className="sm:hidden">{buttonState.shortLabel}</span>
            </>
          )}
        </Button>
      );
    }

    return null;
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">Online Auction</h1>
          </div>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            // Logged in - Show user info and seller management
            <div className="flex items-center gap-3">
              {/* Seller Management Button */}
              {user.role === "seller" && (
                <Button 
                  variant="outline"
                  onClick={() => navigate("/seller-management")}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Quản lý bán hàng</span>
                </Button>
              )}

              {/* Admin Management Button */}
              {user.role === "admin" && (
                <Button 
                  variant="outline"
                  onClick={() => navigate("/admin-management")}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Quản lý hệ thống</span>
                </Button>
              )}

              {/* Upgrade Status Button */}
              {renderUpgradeButton()}

              {/* Feedback Message */}
              {feedbackMessage && (
                <div
                  className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 animate-in fade-in-50 duration-200 ${
                    feedbackMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {feedbackMessage.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{feedbackMessage.text}</span>
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground">
                    {user?.full_name || 'Admin'}
                  </span>
                </button>
    
                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/user-profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 border-t"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            ) : (
            // Not logged in - Show login/register buttons
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button variant="default">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
