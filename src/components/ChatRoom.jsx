import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { MessageCircle } from 'lucide-react';

/**
 * ChatRoom Component
 * Main chat layout with sidebar and chat window
 * Used in ChatPage or as a standalone component
 */
const ChatRoom = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);

  const handleSelectChat = (room) => {
    setIsLoadingRoom(true);
    setSelectedRoom(room);
    // Small delay to show loading state while chat history is being fetched
    setTimeout(() => setIsLoadingRoom(false), 300);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat List */}
      <ChatSidebar
        selectedProductId={selectedRoom?.product_id}
        onSelectChat={handleSelectChat}
        isLoading={isLoadingRoom}
      />

      {/* Chat Window */}
      <ChatWindow room={selectedRoom} isLoading={isLoadingRoom} />

      {/* Mobile View - Show message when no room selected */}
      <div className="md:hidden flex-1 flex flex-col bg-white">
        {selectedRoom ? (
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <h2 className="font-bold text-gray-900">{selectedRoom.other_user?.full_name}</h2>
              <p className="text-xs text-gray-600">{selectedRoom.product_name}</p>
            </div>

            {/* Messages would go here for mobile */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Mobile chat coming soon</p>
            </div>

            {/* Input area for mobile */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Chọn cuộc hội thoại từ danh sách</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
