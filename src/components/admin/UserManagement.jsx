import React, { useState, useEffect } from 'react';
import { getAllUsers, getUpgradeRequests, approveUserUpgrade, rejectUserUpgrade, deleteUser } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import UserDetail from './UserDetail';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Check,
  X,
} from 'lucide-react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('all-users');
  const [allUsers, setAllUsers] = useState([]);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [currentUpgradesPage, setCurrentUpgradesPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
        const [usersRes, upgradeRes] = await Promise.all([
        getAllUsers().catch(() => ({ data: { list: [] } })), // Mock đúng cấu trúc lỗi
        getUpgradeRequests().catch(() => ({ data: [] })),
      ]);

      setAllUsers(usersRes?.data?.list || []);

      setUpgradeRequests(upgradeRes?.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi tải dữ liệu',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleApproveUpgrade = async (userId) => {
    try {
      setProcessingId(userId);
      await approveUserUpgrade(userId);
      setMessage({
        type: 'success',
        text: 'Yêu cầu nâng cấp đã được phê duyệt',
      });
      setUpgradeRequests((prev) =>
        prev.filter((req) => req.user_id !== userId)
      );
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error approving upgrade:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi phê duyệt yêu cầu',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectUpgrade = async (userId) => {
    try {
      setProcessingId(userId);
      await rejectUserUpgrade(userId);
      setMessage({
        type: 'success',
        text: 'Yêu cầu nâng cấp đã bị từ chối',
      });
      setUpgradeRequests((prev) =>
        prev.filter((req) => req.user_id !== userId)
      );
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error rejecting upgrade:', error);
      setMessage({
        type: 'error',
        text: 'Lỗi khi từ chối yêu cầu',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewUserDetail = (user) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleUserSave = (updatedUser) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u))
    );
    setMessage({
      type: 'success',
      text: 'Thông tin người dùng đã được cập nhật',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      seller: { label: 'Seller', color: 'bg-green-100 text-green-800' },
      bidder: { label: 'Bidder', color: 'bg-blue-100 text-blue-800' },
    };
    const config = roleMap[role] || roleMap.bidder;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      locked: { label: 'Bị khóa', color: 'bg-red-100 text-red-800' },
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    };
    const config = statusMap[status] || statusMap.active;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Pagination logic for users
  const totalUsersPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);
  const startUsersIndex = (currentUsersPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = allUsers.slice(
    startUsersIndex,
    startUsersIndex + ITEMS_PER_PAGE
  );

  // Pagination logic for upgrade requests
  const totalUpgradesPages = Math.ceil(upgradeRequests.length / ITEMS_PER_PAGE);
  const startUpgradesIndex = (currentUpgradesPage - 1) * ITEMS_PER_PAGE;
  const paginatedUpgrades = upgradeRequests.slice(
    startUpgradesIndex,
    startUpgradesIndex + ITEMS_PER_PAGE
  );

  const renderPaginationNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản Lý Người Dùng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tài khoản người dùng và phê duyệt yêu cầu nâng cấp
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <p
            className={
              message.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('all-users')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'all-users'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Tất Cả Người Dùng ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('upgrade-requests')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'upgrade-requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Yêu Cầu Nâng Cấp ({upgradeRequests.length})
        </button>
      </div>

      {/* All Users Tab */}
      {activeTab === 'all-users' && (
        <Card>
          <CardHeader>
            <CardTitle>Danh Sách Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có người dùng nào
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Tên
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Email
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Vai Trò
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Trạng Thái
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Ngày Tạo
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-sm">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr
                          key={user.user_id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {user.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            
                              <button 
                              onClick={() => handleViewUserDetail(user)}
                              className="p-2 hover:bg-blue-50 rounded transition-colors inline-block">
                                {/* View User Details Button */}
                                <User className="h-4 w-4 text-blue-600" />
                              </button>
                              <button 
                              onClick={() => deleteUser(user.user_id)}
                              className="p-2 hover:bg-red-50 rounded transition-colors inline-block">
                                <X className="h-4 w-4 text-red-600" />
                              </button>
                            
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalUsersPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Hiển thị {startUsersIndex + 1} đến{' '}
                      {Math.min(startUsersIndex + ITEMS_PER_PAGE, allUsers.length)} trong{' '}
                      {allUsers.length} người dùng
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentUsersPage((prev) => Math.max(1, prev - 1))
                            }
                            className={`${
                              currentUsersPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }`}
                          />
                        </PaginationItem>

                        {renderPaginationNumbers(currentUsersPage, totalUsersPages).map(
                          (page, idx) => (
                            <PaginationItem key={idx}>
                              {page === '...' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => setCurrentUsersPage(page)}
                                  isActive={page === currentUsersPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          )
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentUsersPage((prev) =>
                                Math.min(totalUsersPages, prev + 1)
                              )
                            }
                            className={`${
                              currentUsersPage === totalUsersPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade Requests Tab */}
      {activeTab === 'upgrade-requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Yêu Cầu Nâng Cấp Thành Seller</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : upgradeRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có yêu cầu nâng cấp nào
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Tên Người Dùng
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Email
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Vai Trò Hiện Tại
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-sm">
                          Trạng Thái
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-sm">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUpgrades.map((request) => (
                        <tr
                          key={request.user_id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {request.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {request.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getRoleBadge(request.role)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right space-x-2">
                            <button
                              onClick={() =>
                                handleApproveUpgrade(request.user_id)
                              }
                              disabled={processingId === request.user_id}
                              className="p-2 hover:bg-green-50 rounded transition-colors inline-block disabled:opacity-50"
                            >
                              {processingId === request.user_id ? (
                                <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleRejectUpgrade(request.user_id)
                              }
                              disabled={processingId === request.user_id}
                              className="p-2 hover:bg-red-50 rounded transition-colors inline-block disabled:opacity-50"
                            >
                              {processingId === request.user_id ? (
                                <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalUpgradesPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Hiển thị {startUpgradesIndex + 1} đến{' '}
                      {Math.min(
                        startUpgradesIndex + ITEMS_PER_PAGE,
                        upgradeRequests.length
                      )}{' '}
                      trong {upgradeRequests.length} yêu cầu
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentUpgradesPage((prev) => Math.max(1, prev - 1))
                            }
                            className={`${
                              currentUpgradesPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }`}
                          />
                        </PaginationItem>

                        {renderPaginationNumbers(
                          currentUpgradesPage,
                          totalUpgradesPages
                        ).map((page, idx) => (
                          <PaginationItem key={idx}>
                            {page === '...' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => setCurrentUpgradesPage(page)}
                                isActive={page === currentUpgradesPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentUpgradesPage((prev) =>
                                Math.min(totalUpgradesPages, prev + 1)
                              )
                            }
                            className={`${
                              currentUpgradesPage === totalUpgradesPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      <UserDetail
        isOpen={isUserDetailOpen}
        onClose={() => setIsUserDetailOpen(false)}
        user={selectedUser}
        onSave={handleUserSave}
      />
    </div>
  );
};

export default UserManagement;
