import { useState, useRef, useEffect } from "react";
import { FiPlus, FiChevronLeft, FiMessageSquare } from "react-icons/fi";
import { askPowerBI } from "./api";
import ChatMessage from "./components/ChatMessage";
import Loader from "./components/Loader";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
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

  function createNewChat() {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "👋 New chat started! Ask your questions." }],
    };
    saveChatsToStorage([...chats, newChat]);   //instead of setChats
    setActiveChatId(newChat.id);
    setMessages(newChat.messages);
  }

  // Helper function to update localStorage immediately whenever chats change
  function saveChatsToStorage(updatedChats) {
    setChats(updatedChats);
    localStorage.setItem("pbi_chats", JSON.stringify(updatedChats));
  }

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

    const aiMsg = {
      role: "assistant",
      content: (
        <div className="ai-response">
          {/* Plain text answer */}
          <p>{res.answer}</p>

          {/* Chart visualization */}
          {res.chart && (
            <img
              src={`data:image/png;base64,${res.chart}`}
              alt="Visualization"
              className="chart-image"
            />
          )}

          {/* Table output */}
          {res.table && (
            <pre className="table-output">{res.table}</pre>
          )}
        </div>
      ),
    };


    const updatedMessages = [...newMessages, aiMsg];
    setMessages(updatedMessages);
    updateChatMessages(updatedMessages);

    // Update chat title (first user question)
    if (!getActiveChat().title || getActiveChat().title === "New Chat") {
      renameChat(userMsg.content);
    }
  } catch (err) {
    const errorMsg = {
      role: "assistant",
      content: "⚠️ " + (err.message || "Error retrieving data."),
    };
    const updatedMessages = [...newMessages, errorMsg];
    setMessages(updatedMessages);
    updateChatMessages(updatedMessages);
  } finally {
    setLoading(false);
  }
}


  function updateChatMessages(newMessages) {
    const updated = chats.map((chat) =>
      chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
    );
    saveChatsToStorage(updated);  
  }

  function getActiveChat() {
    return chats.find((c) => c.id === activeChatId);
  }

  function renameChat(firstMessage) {
    const updated = chats.map((c) =>
      c.id === activeChatId ? { ...c, title: firstMessage.slice(0, 25) + "..." } : c
    );
    saveChatsToStorage(updated);  
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // On first load
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    } else if (!activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, []);

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
              {msg.content}
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
