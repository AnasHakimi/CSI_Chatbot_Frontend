import { useState, useRef, useEffect } from "react";
import { askPowerBI } from "./api";
import ChatMessage from "./components/ChatMessage";
import Loader from "./components/Loader";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LZString from "lz-string";       // 🧩 for compression
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("pbi_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load messages when active chat changes
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    if (chat) setMessages(chat.messages);
  }, [activeChatId]);

  // ---- Helpers ----
  function saveChatsToStorage(updatedChats) {
    setChats(updatedChats);
    localStorage.setItem("pbi_chats", JSON.stringify(updatedChats));
  }

  function getActiveChat() {
    return chats.find((c) => c.id === activeChatId);
  }

  function updateChatMessages(newMessages) {
    if (!activeChatId) return; // avoid saving if chat not yet selected

    setChats((prevChats) => {
      const updated = prevChats.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
      );
      localStorage.setItem("pbi_chats", JSON.stringify(updated));
      return updated;
    });
  }

  function renameChat(firstMessage) {
    const updated = chats.map((c) =>
      c.id === activeChatId ? { ...c, title: firstMessage.slice(0, 25) + "..." } : c
    );
    saveChatsToStorage(updated);
  }

  function createNewChat() {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "👋 New chat started! Ask your questions." }],
    };
    saveChatsToStorage([...chats, newChat]);
    setActiveChatId(newChat.id);
    setMessages(newChat.messages);
  }

  // ---- Main sendMessage ----
  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    updateChatMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await askPowerBI(userMsg.content);

      // 🧩 Compress chart before saving
      const aiMsg = {
        role: "assistant",
        content: {
          answer: res.answer || null,
          chart: res.chart ? LZString.compressToBase64(res.chart) : null,
          table: res.table || null,
        },
      };

      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
      updateChatMessages(updatedMessages);

      const currentChat = getActiveChat();
      if (!currentChat.title || currentChat.title === "New Chat") {
        renameChat(userMsg.content);
      }
    } catch (err) {
      const errorMsg = {
        role: "assistant",
        content: {
          answer: "⚠️ " + (err.message || "Error retrieving data."),
          chart: null,
          table: null,
        },
      };
      const updatedMessages = [...newMessages, errorMsg];
      setMessages(updatedMessages);
      updateChatMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  }

  // ---- Handle keyboard ----
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ---- First load ----
  useEffect(() => {
    if (chats.length === 0) createNewChat();
    else if (!activeChatId) setActiveChatId(chats[0].id);
  }, []);

  // ---- Render ----
  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        createNewChat={createNewChat}
        setChats={setChats}
        saveChatsToStorage={saveChatsToStorage}
        darkMode={darkMode}
      />

      <div className="main-chat">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="chat-body">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role}>
              {typeof msg.content === "string" ? (
                msg.content
              ) : (
                <div className="ai-response">
                  {msg.content.answer && (
                    <p className="answer-text">{msg.content.answer}</p>
                  )}
                  {msg.content.chart && (
                    <div className="chart-wrapper">
                      <img
                        src={`data:image/png;base64,${LZString.decompressFromBase64(msg.content.chart)}`}
                        alt="Visualization"
                        className="chart-image"
                        style={{
                          maxWidth: "100%",
                          borderRadius: "10px",
                          marginTop: "1rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      />
                    </div>
                  )}
                  {msg.content.table && (
                    <pre
                      className="table-output"
                      style={{
                        background: "rgb(36 36 36)",
                        padding: "1rem",
                        borderRadius: "8px",
                        overflowX: "auto",
                        marginTop: "1rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {msg.content.table}
                    </pre>
                  )}
                </div>
              )}
            </ChatMessage>
          ))}
          {loading && <Loader />}
          <div ref={chatEndRef} />
        </div>

        <footer className="chat-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your question..."
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </footer>
      </div>
    </div>
  );
}
