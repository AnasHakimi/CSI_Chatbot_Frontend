import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { FiX } from "react-icons/fi"; 

export default function Sidebar({
  open,
  setOpen,
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat,
  setChats,
  saveChatsToStorage,
  darkMode,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  function confirmDelete(chatId) {
    setChatToDelete(chatId);
    setShowConfirm(true);
  }

  function handleDeleteConfirmed() {
    const updated = chats.filter((c) => c.id !== chatToDelete);
    saveChatsToStorage(updated); // Persist immediately

    if (chatToDelete === activeChatId && updated.length > 0) {
      setActiveChatId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveChatId(null);
    }

    setShowConfirm(false);
    setChatToDelete(null);
  }

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>📊 CSI Assist</h2>
          <button className="new-chat-btn" onClick={createNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="chat-placeholder">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${activeChatId === chat.id ? "active" : ""}`}
              >
                <span
                  className="chat-title"
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setOpen(false);
                  }}
                >
                  {chat.title}
                </span>

                {/* ✅ React icon for delete */}
                <button
                  className="delete-btnSidebar"
                  onClick={() => confirmDelete(chat.id)}
                  title="Delete chat"
                >
                  <FiX />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ✅ React icon for close sidebar */}
        <button className="close-sidebar" onClick={() => setOpen(false)} title="Close sidebar">
          <FiX />
        </button>
      </aside>

      <ConfirmModal
        show={showConfirm}
        message="Delete this chat?"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowConfirm(false)}
        darkMode={darkMode}
      />
    </>
  );
}
