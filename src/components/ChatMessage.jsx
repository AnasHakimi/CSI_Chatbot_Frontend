export default function ChatMessage({ role, children }) {
  const mine = role === "user";
  return (
    <div className={`message ${mine ? "user" : "assistant"}`}>
      <div className="bubble">{children}</div>
    </div>
  );
}
