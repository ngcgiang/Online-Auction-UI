import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Users,
  Settings,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router";

const AdminSidebar = ({ activeSection, onNavigate, isOpen, onToggle }) => {
    const navigate = useNavigate();
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Thống kê',
      icon: LayoutDashboard,
      description: 'Tổng quan',
    },
    {
      id: 'categories',
      label: 'Danh mục',
      icon: FolderOpen,
      description: 'Quản lý danh mục',
    },
    {
      id: 'products',
      label: 'Sản phẩm',
      icon: Package,
      description: 'Quản lý sản phẩm',
    },
    {
      id: 'users',
      label: 'Người dùng',
      icon: Users,
      description: 'Quản lý người dùng',
    },
    {
      id: 'system-config',
      label: 'Cấu hình hệ thống',
      icon: Settings,
      description: 'Quản lý cấu hình',
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-primary text-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-16 md:top-0 h-screen md:h-auto md:w-64 bg-white border-r transition-all duration-300 z-30 ${
          isOpen ? 'w-64' : 'w-0 md:w-64'
        } overflow-hidden md:overflow-visible`}
      >
        <div className="p-6 ">
              <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
          </Button>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      onToggle(false);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="text-left flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
