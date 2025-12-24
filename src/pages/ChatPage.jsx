import ChatRoom from '@/components/ChatRoom';

/**
 * ChatPage Component
 * Page for chat functionality
 * Should be added to routing: /chat or similar
 */
const ChatPage = () => {
  return (
    <div className="w-full h-screen bg-gray-50">
      <ChatRoom />
    </div>
  );
};

export default ChatPage;
