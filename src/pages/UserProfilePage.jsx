import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";
import { UserProfile } from "@/components/UserProfile";
import { Header } from "@/components/Header";

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {

      setLoading(true);
      setError(null);

      try {
        const response = await getUserProfile();
        
        // Handle different response structures
        if (response?.data) {
          setUserData(response.data.user);
        } else {
          setUserData(response);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Không thể tải thông tin hồ sơ người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser?.user_id, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Hồ sơ của tôi
            </h1>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
          </div>

          {/* User Profile Card */}
          <UserProfile 
            user={userData} 
            loading={loading} 
            error={!!error}
          />

          {/* Edit Profile Button */}
          {!loading && !error && userData && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => navigate("/edit-profile")}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-600 font-medium">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
