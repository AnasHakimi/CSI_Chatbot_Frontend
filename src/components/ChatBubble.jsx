export default function ChatBubble({ role = "user", children }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[80%] shadow-sm ${
          mine
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
