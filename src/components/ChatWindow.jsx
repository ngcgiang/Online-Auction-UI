import { useEffect, useState, useRef } from 'react';
import { getChatHistory } from '@/services/chatService';
import { useChatSocket } from '@/hooks/useChatSocket';
import { formatDistanceToNow } from 'date-fns';
//import { viVN } from 'date-fns/locale';
import { Send, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

/**
 * ChatWindow Component
 * Main chat window with message history and input
 */
const ChatWindow = ({ room, isLoading: externalLoading }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch chat history when room changes
  useEffect(() => {
    if (!room?.product_id) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getChatHistory(room.product_id);
        if (response) {
          setMessages(response.data || []);
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch chat history');
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError(err.response?.data?.message || 'Failed to fetch chat history');
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Token đang dùng để gửi:", localStorage.getItem('accessToken'));
    fetchHistory();
  }, [room?.product_id]);

  // Socket event handlers
  const handleChatRoomJoined = (data) => {
    console.log('Chat room joined:', data);
    if (data.chatHistory) {
      setMessages(data.chatHistory);
    }
  };

  const handleNewMessage = (data) => {
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleError = (data) => {
    console.error('Chat error:', data);
    if (data.requiresLogin) {
      // Redirect to login if needed
      setError('Vui lòng đăng nhập lại');
    } else {
      setError(data.error || 'Có lỗi xảy ra');
    }
  };

  // Use chat socket hook
  const { sendMessage } = useChatSocket(
    room?.product_id,
    handleChatRoomJoined,
    handleNewMessage,
    handleError
  );

  // Auto-scroll to latest message
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!input.trim()) return;
    if (isSending) return;

    setIsSending(true);
    const success = sendMessage(input);

    if (success) {
      setInput('');
      setError(null);
    } else {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }

    setIsSending(false);
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: false,
        locale: viVN
      });
    } catch (e) {
      return '';
    }
  };

  if (!room) {
    return (
      <div className="hidden md:flex md:flex-col md:flex-1 bg-gray-50 items-center justify-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Chọn một cuộc hội thoại để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="hidden md:flex md:flex-col md:flex-1 bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {room.other_user?.full_name || 'Unknown User'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sản phẩm: <span className="font-medium">{room.product_name}</span>
            </p>
          </div>
          <span
            className={cn(
              'text-sm font-medium px-3 py-1 rounded-full',
              room.your_role === 'seller'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            )}
          >
            {room.your_role === 'seller' ? 'Bán hàng' : 'Thắng đấu giá'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {isLoading || externalLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Đang tải lịch sử chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Không có tin nhắn nào</p>
              <p className="text-xs text-gray-400 mt-1">Hãy bắt đầu cuộc trò chuyện</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.user_id;
            return (
              <div
                key={message.message_id}
                className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-4 py-2 break-words',
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    )}
                  >
                    {formatMessageTime(message.sent_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="px-6 py-4 border-t border-gray-200 bg-white"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={isSending || isLoading || externalLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            maxLength={5000}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending || isLoading || externalLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {input.length}/5000
        </p>
      </form>
    </div>
  );
};

import { MessageCircle } from 'lucide-react';

export default ChatWindow;
