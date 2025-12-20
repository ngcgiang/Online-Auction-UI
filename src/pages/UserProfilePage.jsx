import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Edit, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";
import { UserProfile } from "@/components/UserProfile";
import { Header } from "@/components/Header";
import { UpdateUserPage } from "./UpdateUserPage";

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "edit" | "password"

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfile();
        if (response?.data) {
          setUserData(response.data.user);
        } else {
          setUserData(response);
        }
      } catch (err) {
        setError("Không thể tải thông tin hồ sơ người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [authUser?.user_id, navigate]);

  // Sidebar items
  const sidebarItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <User className="w-5 h-5 mr-2" />,
    },
    {
      key: "edit",
      label: "Chỉnh sửa thông tin cá nhân",
      icon: <Edit className="w-5 h-5 mr-2" />,
    },
    {
      key: "password",
      label: "Đổi mật khẩu",
      icon: <KeyRound className="w-5 h-5 mr-2" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Back Button */}
      <div className="border-b bg-white">
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
      {/* Main Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-5xl mx-auto">
          {/* Sidebar */}
          <aside className="w-64 bg-white border rounded-xl shadow-sm h-fit">
            <nav className="flex flex-col py-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center px-6 py-3 text-left font-medium rounded-lg transition-colors
                    ${
                      activeTab === item.key
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Hồ sơ của tôi
              </h1>
              <p className="text-muted-foreground">
                Quản lý thông tin cá nhân và cài đặt tài khoản
              </p>
            </div>
            <div>
              {activeTab === "profile" && (
                <UserProfile user={userData} loading={loading} error={!!error} />
              )}
              {activeTab === "edit" && (
                // Sử dụng lại form từ UpdateUserPage, chỉ hiển thị tab "Thông tin cá nhân"
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UpdateUserPage onlyProfileTab />
                </div>
              )}
              {activeTab === "password" && (
                // Sử dụng lại form từ UpdateUserPage, chỉ hiển thị tab "Đổi mật khẩu"
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UpdateUserPage onlyPasswordTab />
                </div>
              )}
              {error && (
                <Card className="mt-6 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <p className="text-red-600 font-medium">{error}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
