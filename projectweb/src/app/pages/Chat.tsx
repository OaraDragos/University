import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { ChatMessage, createChatMessage, listChatMessages } from "../services/chatApi";
import { ApiError } from "../services/networkClient";
import { connectRealtime } from "../services/realtimeClient";

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentGroup, currentMember, isHydrated, clearCurrentSelection } = useGroup();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  const goToGroupMenu = React.useCallback(() => {
    navigate("/home");
  }, [navigate]);

  React.useEffect(() => {
    if (!isHydrated || !user || !currentGroup) return;

    void (async () => {
      try {
        const response = await listChatMessages(currentGroup.id, user.id, 80);
        setMessages(response.messages);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          clearCurrentSelection();
          navigate("/home", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load chat");
      }
    })();
  }, [clearCurrentSelection, currentGroup, isHydrated, navigate, user]);

  React.useEffect(() => {
    if (!currentGroup) return;

    const disconnect = connectRealtime((event) => {
      if (event.type === "chat_message") {
        if (event.payload?.groupId !== currentGroup.id) return;
        const incoming = event.payload?.message as ChatMessage | undefined;
        if (!incoming) return;
        setMessages((current) => {
          if (current.some((message) => message.id === incoming.id)) {
            return current;
          }
          return [...current, incoming].slice(-80);
        });
      }

      if (event.type === "chat_error") {
        setError(String(event.payload?.error ?? "Chat error"));
      }
    });

    return disconnect;
  }, [currentGroup]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !currentGroup) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setText("");
    setError(null);

    try {
      const created = await createChatMessage({ groupId: currentGroup.id, userId: user.id, text: trimmed });
      setMessages((current) => {
        if (current.some((message) => message.id === created.id)) {
          return current;
        }
        return [...current, created].slice(-80);
      });
    } catch (err) {
      setText(trimmed);
      setError(err instanceof Error ? err.message : "Could not send message");
    }
  }

  React.useEffect(() => {
    if (isHydrated && (!currentGroup || !currentMember)) {
      navigate("/home", { replace: true });
    }
  }, [currentGroup, currentMember, isHydrated, navigate]);

  if (!user || !isHydrated || !currentGroup || !currentMember) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "Inter, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
            style={{
              width: "36px",
              height: "36px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: "10px",
            }}
          >
            <ArrowLeft size={16} color="#0F172A" />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "20px", color: "#0F172A", fontWeight: 700 }}>
              Live Chat
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748B" }}>
              {currentGroup.name} - signed in as {user.username}
            </p>
          </div>

          <button
            onClick={goToGroupMenu}
            aria-label="Choose another group"
            style={{
              height: "36px",
              border: "1px solid #CBD5E1",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "0 11px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Users size={15} />
            Back to groups
          </button>
        </div>
      </header>

      <main style={{ flex: 1, width: "100%", maxWidth: "760px", margin: "0 auto", padding: "16px" }}>
        {error && (
          <div style={{ marginBottom: "12px", border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "12px", padding: "10px 12px", fontSize: "14px" }}>
            {error}
            <button
              type="button"
              onClick={goToGroupMenu}
              style={{
                marginTop: "10px",
                width: "100%",
                height: "40px",
                border: "none",
                borderRadius: "12px",
                backgroundColor: "#B91C1C",
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to groups
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "96px" }}>
          {messages.length === 0 ? (
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "28px", textAlign: "center", color: "#64748B" }}>
              No messages yet.
            </div>
          ) : (
            messages.map((message) => {
              const own = message.userId === user.id;
              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: own ? "flex-end" : "flex-start",
                    maxWidth: "78%",
                    backgroundColor: own ? "#2563EB" : "#FFFFFF",
                    color: own ? "#FFFFFF" : "#0F172A",
                    border: own ? "1px solid #2563EB" : "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "10px 12px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{message.username}</span>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>{message.role}</span>
                  </div>
                  <div style={{ fontSize: "15px", lineHeight: 1.45, overflowWrap: "anywhere" }}>{message.text}</div>
                  <div style={{ marginTop: "6px", fontSize: "11px", opacity: 0.7 }}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <form
        onSubmit={handleSend}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E5E7EB",
          padding: "12px 16px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            placeholder="Message"
            style={{
              flex: 1,
              minWidth: 0,
              height: "44px",
              borderRadius: "14px",
              border: "1px solid #CBD5E1",
              padding: "0 12px",
              fontSize: "16px",
              color: "#0F172A",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send message"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: text.trim() ? "#2563EB" : "#CBD5E1",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: text.trim() ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
