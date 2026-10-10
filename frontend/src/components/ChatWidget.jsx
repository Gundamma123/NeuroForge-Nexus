import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Send, X, Trash2 } from "lucide-react";
import { sendChat } from "../services/chatService";
import { isAuthenticated } from "../services/userService";

const SUGGESTIONS = [
  "Summarize my projects",
  "Which tasks are overdue?",
  "What is the status of my sprints?",
];

const HIDDEN_ROUTES = ["/login", "/register", "/oauth/callback"];

const ChatWidget = () => {
  console.log("CHAT WIDGET COMPONENT IS RUNNING");
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, open]);

  if (!isAuthenticated() || HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      const data = await sendChat(nextMessages);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data?.reply || "No response received from the AI assistant." },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "The AI assistant is unavailable. Make sure Ollama is running."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <>
      {open && (
        <div className="nf-chat-panel">
          <div className="nf-chat-header">
            <div className="nf-chat-title">
              <Bot size={18} />
              <span>NeuroForge Assistant</span>
            </div>

            <div className="nf-chat-header-actions">
              <button type="button" className="nf-chat-icon-btn" onClick={clearChat} title="Clear chat">
                <Trash2 size={16} />
              </button>
              <button type="button" className="nf-chat-icon-btn" onClick={() => setOpen(false)} title="Close">
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="nf-chat-body">
            {messages.length === 0 && (
              <div className="nf-chat-welcome">
                <p>Hi! I am the NeuroForge AI Assistant. Ask me about your projects, sprints or tasks.</p>
                <div className="nf-chat-suggestions">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="nf-chat-chip"
                      onClick={() => send(suggestion)}
                      disabled={sending}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`nf-chat-msg ${message.role === "user" ? "user" : "bot"}`}>
                {message.content}
              </div>
            ))}

            {sending && <div className="nf-chat-msg bot nf-chat-typing">Thinking...</div>}
            {error && <div className="nf-form-error" style={{ margin: 0 }}>{error}</div>}
            <div ref={endRef} />
          </div>

          <div className="nf-chat-input-row">
            <textarea
              rows={1}
              value={input}
              placeholder="Ask something..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              disabled={sending}
            />
            <button
              type="button"
              className="nf-chat-send"
              onClick={() => send()}
              disabled={sending || !input.trim()}
              title="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="nf-chat-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open NeuroForge AI Assistant"
        title="NeuroForge AI Assistant"
      >
        {open ? <X size={23} /> : <Bot size={23} />}
      </button>
    </>
  );
};

export default ChatWidget;