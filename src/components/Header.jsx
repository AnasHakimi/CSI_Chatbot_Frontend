import { FiMenu } from "react-icons/fi";

export default function Header({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="chat-header">
      <div className="left">
        {/* Sidebar toggle button (mobile only) */}
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FiMenu />
        </button>

        {/* Logo + Title */}
        <div className="logo-title">
          <img
            src="src/assets/SSM.png"
            alt="SSM Logo"
            className="ssm-logo"
          />
          {/*<h2>CSI Assist</h2>*/}
        </div>
      </div>

      <div className="right">
        {/* Dark mode toggle */}
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </header>
  );
}
