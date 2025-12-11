import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ChevronDown, ChevronUp, Send } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString("vi-VN");
}

function QnAComment({ comment, depth = 0, onReplySubmit }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleSubmitReply = async () => {
    if (replyText.trim()) {
      if (onReplySubmit) {
        await onReplySubmit(comment.comment_id, replyText);
      }
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`space-y-2 ${depth > 0 ? "ml-6 pl-4 border-l-2 border-slate-200" : ""}`}>
      {/* Main Comment/Question */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-1">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">
                {comment.user?.full_name || "Ẩn danh"}
              </span>
              {comment.user?.is_seller && (
                <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                  Người bán
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-foreground mt-2 wrap-break-word">
              {comment.content}
            </p>
          </div>
        </div>

        {/* Reply Button */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Trả lời
          </Button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
            <Input
              type="text"
              placeholder="Nhập câu trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitReply()}
              className="text-sm"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleSubmitReply}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium ml-8 my-2"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Ẩn {comment.replies.length} câu trả lời
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Hiện {comment.replies.length} câu trả lời
              </>
            )}
          </button>

          {showReplies && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <QnAComment
                  key={reply.comment_id}
                  comment={reply}
                  depth={depth + 1}
                  onReplySubmit={onReplySubmit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QnAThread({ comment, onReplySubmit }) {
  return (
    <QnAComment
      comment={comment}
      depth={0}
      onReplySubmit={onReplySubmit}
    />
  );
}
