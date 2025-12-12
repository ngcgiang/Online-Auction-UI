import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

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
            <h1 className="text-2xl font-bold text-foreground">Auction</h1>
          </div>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            // Logged in - Show user avatar with logout on hover
            <div 
              className="flex items-center gap-3"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative">
                <div className="flex items-center gap-2 cursor-pointer transition-colors hover:text-primary">
                  <User className="h-5 w-5" />
                  <div className="hidden sm:block text-sm">
                    <p className="font-medium text-foreground">{user.full_name}</p>
                    {user.upgrade_at && new Date() - new Date(user.upgrade_at) > 7*24*60*60*1000 ? (
                      <p className="text-xs text-muted-foreground">Expired Seller</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Logout Button - Show on hover */}
              {isHovering && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              )}
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
