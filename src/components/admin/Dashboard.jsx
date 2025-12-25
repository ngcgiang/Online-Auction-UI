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
} from 'recharts';
import {
  getTotalIncome,
  getNewUsers,
  getTotalOrders,
  getMonthlyIncome,
  getUpgradeRequests,
} from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, Package, Clock } from 'lucide-react';

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [auctionData, setAuctionData] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [incomeRes, usersRes, ordersRes, monthlyRes, upgradeRes] =
          await Promise.all([
            getTotalIncome().catch(() => ({ data: 0 })),
            getNewUsers().catch(() => ({ data: 0 })),
            getTotalOrders().catch(() => ({ data: 0 })),
            getMonthlyIncome().catch(() => ({ data: [] })),
            getUpgradeRequests().catch(() => ({ data: [] })),
          ]);

        // Handle data extraction from API responses
        // getTotalIncome - extract numeric value
        const incomeValue = typeof incomeRes?.data === 'number'
          ? incomeRes.data
          : incomeRes?.data?.total_income || 0;
        setTotalIncome(incomeValue);

        // getNewUsers - extract total_new_users from object structure
        const usersValue = usersRes?.data?.list.total_new_users || 0;
        setNewUsers(usersValue);

        // getTotalOrders - extract numeric value
        const ordersValue = typeof ordersRes?.data === 'number'
          ? ordersRes.data
          : ordersRes?.data?.total_orders || 0;
        setTotalOrders(ordersValue);
        console.log('Total Orders:', ordersRes);
        
        const upgradeData = Array.isArray(upgradeRes?.data?.list) 
          ? upgradeRes.data.list 
          : Array.isArray(upgradeRes?.data) 
          ? upgradeRes.data 
          : [];
        setPendingRequests(upgradeData?.length || 0);

        // Mock monthly data if needed
        const monthlyList = Array.isArray(monthlyRes?.data?.list) 
          ? monthlyRes.data.list 
          : Array.isArray(monthlyRes?.data) 
          ? monthlyRes.data 
          : [];
        if (monthlyList.length === 0) {
          setMonthlyData(generateMockMonthlyData());
        } else {
          setMonthlyData(monthlyList);
        }

        // Mock auction data
        setAuctionData([
          { name: 'Hoàn thành', value: 450 },
          { name: 'Đang diễn ra', value: 280 },
        ]);

        // Mock user distribution
        setUserDistribution([
          { name: 'Bidder', value: 65 },
          { name: 'Seller', value: 35 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data generator for monthly income
  const generateMockMonthlyData = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((month) => ({
      name: month,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#ef4444'];
  const USER_COLORS = ['#8b5cf6', '#10b981'];

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
              <>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalIncome)}
                </div>
              </>
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
              <>
                <div className="text-2xl font-bold text-foreground">
                  {newUsers}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Đấu Giá
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {totalOrders}
                </div>
              </>
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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value}%)`}
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
                  <Tooltip formatter={(value) => `${value}%`} />
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
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={auctionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Số Lượng" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
