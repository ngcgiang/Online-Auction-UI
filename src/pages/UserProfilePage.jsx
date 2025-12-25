
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft,Medal, ChevronRight, User, Edit, KeyRound, Menu, X, ShoppingCart, Heart,MessageCircleMore } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getUserProfile } from "@/services/userService"
import { UserProfile } from "@/components/UserProfile"
import { Header } from "@/components/Header"
import { UpdateUserPage } from "./UpdateUserPage"
import { UserWatchListPage } from "./UserWatchListPage"
import { UserBiddedProductsPage } from "./UserBiddedPage"
import { UserRatingsPage } from "./UserRatingsPage"
import ChatRoom from "@/components/ChatRoom"
import { UserWonProductsPage } from "./UserWonProducts"
export function UserProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: authUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const pathSegments = location.pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    return lastSegment || "profile"
  }

  const activeTab = getActiveTabFromPath()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getUserProfile()
        if (response?.data) {
          setUserData(response.data.user)
        } else {
          setUserData(response)
        }
      } catch (err) {
        setError("Không thể tải thông tin hồ sơ người dùng")
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [authUser?.user_id, navigate])

  const pageHeaders = {
    profile: {
      title: "Hồ sơ của tôi",
      description: "Quản lý thông tin cá nhân"
    },
    chat: {
      title: "Hộp thư",
      description: "Quản lý tin nhắn giữa bạn và người bán/người mua"
    },
    edit: {
      title: "Chỉnh sửa thông tin cá nhân",
      description: "Cập nhật các thông tin cơ bản của bạn"
    },
    password: {
      title: "Đổi mật khẩu",
      description: "Thay đổi mật khẩu đăng nhập tài khoản của bạn"
    },
    watchlist: {
      title: "Danh sách theo dõi",
      description: "Các sản phẩm bạn đang theo dõi và quan tâm"
    },
    "bidded-products": {
      title: "Sản phẩm đã tham gia",
      description: "Các sản phẩm bạn đã tham gia đấu giá"
    },
    "won-products": {
      title: "Sản phẩm đã thắng",
      description: "Các sản phẩm bạn đã thắng đấu giá"
    },
    ratings: {
      title: "Đánh giá",
      description: "Các đánh giá về bạn từ những người khác"
    }
  }

  const sidebarItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: User,
    },
    {
      key: "chat",
      label: "Hộp thư",
      icon: MessageCircleMore,
    },
    {
      key: "edit",
      label: "Chỉnh sửa thông tin cá nhân",
      icon: Edit,
    },
    {
      key: "password",
      label: "Đổi mật khẩu",
      icon: KeyRound,
    },
    {
      key: "watchlist",
      label: "Danh sách sản phẩm đang theo dõi",
      icon: Heart,
    },
    {
      key: "bidded-products",
      label: "Danh sách sản phẩm đã tham gia đấu giá",
      icon: ShoppingCart,
    },
    {
      key: "won-products",
      label: "Danh sách sản phẩm đã thắng đấu giá",
      icon: Medal,
    },
    {
      key: "ratings",
      label: "Danh sách đánh giá vể người dùng",
      icon: MessageCircleMore,
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-primary text-white"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="flex">
        {/* Sidebar - Updated to match seller-sidebar styling */}
        <aside
          className={`fixed md:static left-0 top-16 md:top-0 h-screen md:h-auto md:w-64 bg-white border-r transition-all duration-300 z-30 ${
            isSidebarOpen ? "w-64" : "w-0 md:w-64"
          } overflow-hidden md:overflow-visible`}
        >
          <div className="p-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      const path = item.key === "profile" ? "/user-profile/profile" : `/user-profile/${item.key}`
                      navigate(path)
                      if (window.innerWidth < 768) setIsSidebarOpen(false)
                    }}
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      isActive ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="text-left flex-1">
                      <p className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{item.label}</p>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>
        {/* Main Content */}
        <section className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">{pageHeaders[activeTab]?.title}</h1>
              <p className="text-muted-foreground">{pageHeaders[activeTab]?.description}</p>
            </div>
            <div>
              {activeTab === "profile" && <UserProfile user={userData} loading={loading} error={!!error} />}
              {activeTab === "edit" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UpdateUserPage onlyProfileTab />
                </div>
              )}
              {/*Chat tab */}
              {activeTab === "chat" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <ChatRoom />
                </div>
              )}
              {activeTab === "password" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UpdateUserPage onlyPasswordTab />
                </div>
              )}
              {activeTab === "watchlist" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UserWatchListPage detailType="watchlist" />
                </div>
              )}
              {activeTab === "bidded-products" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UserBiddedProductsPage />
                </div>
              )}
              {activeTab === "ratings" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UserRatingsPage />
                </div>
              )}
              {activeTab === "won-products" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <UserWonProductsPage />
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
          </div>
        </section>
      </div>
    </div>
  )
}
