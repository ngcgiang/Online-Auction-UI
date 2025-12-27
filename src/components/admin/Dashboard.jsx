import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  getTotalIncome,
  getNewUsers,
  getTotalOrders,
  getMonthlyIncome,
  getUpgradeRequests,
  countUsersByRole,
  countProductsByStatus,
  countAllBids,
} from '@/services/adminService';
import { getAllProducts } from '@/services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, Package, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [auctionData, setAuctionData] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          incomeRes,
          usersRes,
          ordersRes,
          monthlyRes,
          upgradeRes,
          userRoleRes,
          productStatusRes,
          bidsRes,
        ] = await Promise.all([
          getTotalIncome().catch(() => ({ data: 0 })),
          getNewUsers().catch(() => ({ data: { list: { total_new_users: 0 } } })),
          getTotalOrders().catch(() => ({ data: 0 })),
          getMonthlyIncome().catch(() => ({ data: [] })),
          getUpgradeRequests().catch(() => ({ data: [] })),
          countUsersByRole().catch(() => ({ data: {} })),
          countProductsByStatus().catch(() => ({ data: {} })),
          countAllBids().catch(() => ({ data: {} })),
        ]);

        // Tổng doanh thu
        const incomeValue = typeof incomeRes?.data === 'number'
          ? incomeRes.data
          : incomeRes?.data?.total_income || 0;
        setTotalIncome(incomeValue);

        // Người dùng mới
        const usersValue = usersRes?.data?.list?.total_new_users || usersRes?.data?.total_new_users || 0;
        setNewUsers(usersValue);

        // Tổng số lượt đấu giá (bids)
        const bidsValue = bidsRes?.data?.totalBids || 0;
        setTotalBids(bidsValue);

        // Tổng số đơn hàng (orders)
        const ordersValue = typeof ordersRes?.data === 'number'
          ? ordersRes.data
          : ordersRes?.data?.total_orders || 0;
        setTotalOrders(ordersValue);

        // Yêu cầu nâng cấp
        const upgradeData = Array.isArray(upgradeRes?.data?.list)
          ? upgradeRes.data.list
          : Array.isArray(upgradeRes?.data)
          ? upgradeRes.data
          : [];
        setPendingRequests(upgradeData?.length || 0);

        // Doanh thu theo tháng
        const monthlyList = Array.isArray(monthlyRes?.data?.list)
          ? monthlyRes.data.list
          : Array.isArray(monthlyRes?.data)
          ? monthlyRes.data
          : [];
        const transformedMonthlyData = monthlyList.map(item => {
          if (item.name && item.revenue !== undefined) {
            return item;
          }
          return {
            name: item.month || item.name || item.period || 'Unknown',
            revenue: item.revenue || item.income || item.total || 0
          };
        });
        setMonthlyData(transformedMonthlyData);

        // Phân phối người dùng (PieChart)
        const userRoleData = userRoleRes?.data || {};
        setUserDistribution([
          { name: 'Seller', value: userRoleData.total_sellers || 0 },
          { name: 'Bidder', value: userRoleData.total_bidders || 0 },
        ]);

        // Trạng thái sản phẩm (BarChart)
        const productStatusData = productStatusRes?.data?.product_status_counts || {};
        setAuctionData([
          { name: 'Đã bán', value: productStatusData.sold || 0 },
          { name: 'Đang hoạt động', value: productStatusData.active || 0 },
          { name: 'Đã hết hạn', value: productStatusData.expired || 0 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const USER_COLORS = ['#8b5cf6', '#10b981'];

  // Custom label for pie chart to show counts
  const renderCustomLabel = ({ name, value }) => {
    return `${name} (${value})`;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan về hệ thống đấu giá
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Doanh Thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalIncome)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Người Dùng Mới
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {newUsers}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Bids Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Lượt Đấu Giá
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {totalBids}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yêu Cầu Chờ Xử Lý
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {pendingRequests}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cần xử lý ngay
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh Thu Theo Tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80" />
            ) : monthlyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Không có dữ liệu doanh thu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                    name="Doanh Thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân Phối Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80" />
            ) : userDistribution.length === 0 || userDistribution.every(item => item.value === 0) ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Không có dữ liệu người dùng
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={USER_COLORS[index % USER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auction Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng Thái Đấu Giá</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80" />
          ) : auctionData.length === 0 || auctionData.every(item => item.value === 0) ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Không có dữ liệu đấu giá
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={auctionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Số Lượng">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;