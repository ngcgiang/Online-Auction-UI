// Get auction status breakdown (completed, ongoing)
import apiClient from '@/lib/axios';

export const getAuctionStatusBreakdown = async () => {
  return apiClient.get('/api/admin/auction-status-breakdown');
};
