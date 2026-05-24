import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Trash, Sun, Moon } from "lucide-react";
import LogoFile from "../assets/logo.svg";
import { useSelector, useDispatch } from "react-redux";
import { logoutService } from "../services/auth.service";
import { logout } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isDark = useSelector((s) => s.theme.mode === "dark");

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch {
      // ignore server error — always clear local state
    } finally {
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
      setIsOpen(false);
    }
  };

  const navLinks = isAuthenticated
    ? [
        { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Profile", href: "/profile", icon: <User size={18} /> },
        { name: "Trash", href: "/trash", icon: <Trash size={18} /> },
      ]
    : [
        { name: "Github", href: "https://github.com/talhaarain54", isExternal: true },
      ];

  const navBase = isDark
    ? "sticky top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700"
    : "sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200";

  return (
    <nav className={navBase}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src={LogoFile} alt="Logo" className="w-8 h-8" />
          <span className={`text-xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
            NoteBase
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold">
          {navLinks.map((link) =>
            link.isExternal ? (
              <a key={link.name} href={link.href} target="_blank" rel="noreferrer"
                className={isDark ? "text-slate-300 hover:text-blue-400 transition-colors" : "text-slate-600 hover:text-blue-700 transition-colors"}>
                {link.name}
              </a>
            ) : (
              <Link key={link.name} to={link.href}
                className={`flex items-center gap-2 ${isDark ? "text-slate-300 hover:text-blue-400 transition-colors" : "text-slate-600 hover:text-blue-700 transition-colors"}`}>
                {link.icon} {link.name}
              </Link>
            )
          )}

          {/* Dark Mode Toggle */}
          <button onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-xl transition-all ${isDark ? "bg-slate-700 text-yellow-400 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <button onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-xl transition-all font-bold">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link to="/login"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-xl transition-all font-bold shadow shadow-blue-100">
              Login
            </Link>
          )}
        </div>

        {/* MOBILE: toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-xl ${isDark ? "bg-slate-700 text-yellow-400" : "bg-slate-100 text-slate-600"}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={`p-2 ${isDark ? "text-white" : "text-slate-900"}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full border-b shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
          {navLinks.map((link) =>
            link.isExternal ? (
              <a key={link.name} href={link.href} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)}
                className={`text-lg font-bold border-b pb-2 flex items-center gap-3 ${isDark ? "text-slate-200 border-slate-700" : "text-slate-700 border-slate-50"}`}>
                {link.icon} {link.name}
              </a>
            ) : (
              <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}
                className={`text-lg font-bold border-b pb-2 flex items-center gap-3 ${isDark ? "text-slate-200 border-slate-700" : "text-slate-700 border-slate-50"}`}>
                {link.icon} {link.name}
              </Link>
            )
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout}
              className="w-full text-center bg-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow">
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)}
              className="w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}