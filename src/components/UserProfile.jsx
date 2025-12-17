import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, MapPin, Calendar, Star } from "lucide-react";

/**
 * UserProfile Component
 * Displays user profile information with seller package status
 *
 * @param {Object} user - User data object
 * @param {boolean} loading - Loading state
 * @param {boolean} error - Error state
 */
export function UserProfile({ user, loading = false, error = false }) {
  /**
   * Calculate seller status using useMemo to avoid state updates in effect
   */
  const sellerStatus = useMemo(() => {
    if (!user?.upgrade_at || user?.role !== "seller") {
      return null;
    }

    const upgradeDate = new Date(user.upgrade_at);
    const today = new Date();
    const daysPassed = Math.floor(
      (today - upgradeDate) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = Math.max(0, 7 - daysPassed);

    return {
      daysPassed,
      remainingDays,
      isExpired: daysPassed > 7,
    };
  }, [user]);

  /**
   * Format date to DD/MM/YYYY
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   * Get role badge color and text
   */
  const getRoleBadge = () => {
    switch (user?.role) {
      case "seller":
        return {
          label: "Người bán",
          className: "bg-blue-100 text-blue-800",
        };
      case "buyer":
        return {
          label: "Người mua",
          className: "bg-green-100 text-green-800",
        };
      case "admin":
        return {
          label: "Quản trị viên",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: user?.role,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  /**
   * Get seller package status badge
   */
  const getSellerPackageBadge = () => {
    if (!sellerStatus) return null;

    if (sellerStatus.isExpired) {
      return {
        label: "Gói Seller: Đã hết hạn",
        className: "bg-red-100 text-red-800",
      };
    } else {
      return {
        label: `Gói Seller: Còn hiệu lực (Còn ${sellerStatus.remainingDays} ngày)`,
        className: "bg-emerald-100 text-emerald-800",
      };
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-center text-red-600 font-medium">
            Không thể tải thông tin người dùng
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleBadge = getRoleBadge();
  const sellerPackageBadge = getSellerPackageBadge();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-blue-50 to-blue-100 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Side: Name & Role */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-blue-500 flex items-center justify-center text-white shadow-md">
              <User className="h-8 w-8" />
            </div>

            {/* Name & Role Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {user.full_name}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={`${roleBadge.className} border-0`}
                >
                  {roleBadge.label}
                </Badge>

                {/* Seller Package Status */}
                {user.role === "seller" && sellerPackageBadge && (
                  <Badge
                    variant="secondary"
                    className={`${sellerPackageBadge.className} border-0`}
                  >
                    {sellerPackageBadge.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Rating Score */}
          {user.rating_score !== undefined && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{user.rating_score}</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Details Section */}
      <CardContent className="p-6 space-y-4">
        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Email</p>
            <p className="text-foreground font-medium break-all">
              {user.email}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Địa chỉ</p>
            <p className="text-foreground font-medium">
              {user.address || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Ngày sinh
            </p>
            <p className="text-foreground font-medium">
              {user.dob ? formatDate(user.dob) : "Chưa cập nhật"}
            </p>
          </div>
        </div>

        {/* Account Created Date */}
        <div className="flex items-start gap-3 pt-2 border-t">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Ngày tạo tài khoản
            </p>
            <p className="text-foreground font-medium">
              {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
