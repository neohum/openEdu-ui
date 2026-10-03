import React, { useRef, useState, useEffect, forwardRef, type HTMLAttributes } from "react";
import "./chat.css";

export type MessageRole = "user" | "assistant" | "system" | "tutor";

export interface ChatMessageItem {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: number;
  senderName?: string;
  avatarUrl?: string;
}

export interface ChatProps extends HTMLAttributes<HTMLDivElement> {
  mode?: "messenger" | "assistant";
  children: React.ReactNode;
}

export const Chat = forwardRef<HTMLDivElement, ChatProps>(
  ({ mode = "assistant", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-chat", `oe-chat--${mode}`, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Chat.displayName = "Chat";

export interface ChatHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function ChatHeader({ title, subtitle, actions, className = "" }: ChatHeaderProps) {
  return (
    <div className={["oe-chat-header oe-glass oe-glass--blur", className].filter(Boolean).join(" ")}>
      <div className="oe-chat-header__info">
        <h3 className="oe-chat-header__title">{title}</h3>
        {subtitle && <p className="oe-chat-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="oe-chat-header__actions">{actions}</div>}
    </div>
  );
}

export interface ChatMessageListProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ChatMessageList({ className = "", children, ...props }: ChatMessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={listRef}
      className={["oe-chat-message-list", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ChatMessageProps {
  message: ChatMessageItem;
  className?: string;
}

export function ChatMessage({ message, className = "" }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={[
        "oe-chat-message",
        `oe-chat-message--${message.role}`,
        isUser ? "oe-chat-message--outgoing" : "oe-chat-message--incoming",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!isUser && (
        <div className="oe-chat-message__avatar">
          {message.avatarUrl ? (
            <img src={message.avatarUrl} alt="" />
          ) : (
            <span className="oe-chat-message__avatar-fallback">
              {message.role === "assistant" || message.role === "tutor" ? "AI" : "T"}
            </span>
          )}
        </div>
      )}
      <div className="oe-chat-message__bubble">
        {message.senderName && !isUser && (
          <span className="oe-chat-message__name">{message.senderName}</span>
        )}
        <div className="oe-chat-message__text">{message.content}</div>
        {message.timestamp && (
          <span className="oe-chat-message__time">
            {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export interface ChatComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatComposer({
  onSend,
  placeholder = "질문이나 풀이과정을 입력하세요...",
  disabled = false,
  className = "",
}: ChatComposerProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      className={["oe-chat-composer oe-glass oe-glass--blur", className].filter(Boolean).join(" ")}
      onSubmit={handleSubmit}
    >
      <textarea
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="oe-chat-composer__input"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="oe-chat-composer__send-btn"
        aria-label="메시지 전송"
      >
        ▲
      </button>
    </form>
  );
}
