import { useEffect, useState } from 'react';
import { getChatRooms } from '@/services/chatService';
import { formatDistanceToNow } from 'date-fns';
import { Search, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ChatSidebar Component
 * Displays list of chat conversations (filtered by seller/winner role)
 */
const ChatSidebar = ({ selectedProductId, onSelectChat, isLoading: externalLoading }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chat rooms on mount
  useEffect(() => {
    const fetchChatRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getChatRooms();
        if (response.success) {
          setChatRooms(response.data || []);
          setFilteredRooms(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch chat rooms');
        }
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError(err.response?.data?.message || 'Failed to fetch chat rooms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  // Filter chat rooms based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(chatRooms);
    } else {
      const filtered = chatRooms.filter((room) =>
        room.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, chatRooms]);

  // Get role badge text
  const getRoleBadge = (role) => {
    return role === 'seller' ? 'Bán hàng' : 'Thắng đấu giá';
  };

  const getRoleBadgeColor = (role) => {
    return role === 'seller'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  // Format end time
  const formatEndTime = (endTime) => {
    try {
      return formatDistanceToNow(new Date(endTime), {
        addSuffix: true,
      });
    } catch (e) {
      return 'Thời gian không xác định';
    }
  };

  return (
    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tin nhắn</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm cuộc hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading || externalLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredRooms.map((room) => (
              <button
                key={room.product_id}
                onClick={() => onSelectChat(room)}
                className={cn(
                  'w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4',
                  selectedProductId === room.product_id
                    ? 'bg-blue-50 border-l-blue-500'
                    : 'border-l-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.other_user?.full_name || 'Unknown User'}
                      </h3>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2',
                          getRoleBadgeColor(room.your_role)
                        )}
                      >
                        {getRoleBadge(room.your_role)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 truncate mb-1">
                      {room.product_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Kết thúc: {formatEndTime(room.end_time)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">
              {searchTerm.trim() ? 'Không tìm thấy cuộc hội thoại nào' : 'Bạn chưa có cuộc hội thoại nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
