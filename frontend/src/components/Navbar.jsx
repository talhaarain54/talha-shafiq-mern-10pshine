import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Trash } from "lucide-react";
import LogoFile from "../assets/logo.svg";
import { useSelector, useDispatch } from "react-redux";
import { logoutService } from "../services/auth.service";
import { logout } from "../features/authSlice";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
      setIsOpen(false);
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const navLinks = isAuthenticated
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        { name: "Profile", href: "/profile", icon: <User size={18} /> },
        { name: "Trash", href: "/trash", icon: <Trash size={18} /> },
      ]
    : [
        {
          name: "Github",
          href: "https://github.com/talhaarain54",
          isExternal: true,
        },
      ];

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src={LogoFile} alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            NoteBase
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          {navLinks.map((link) =>
            link.isExternal ? (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-blue-700 transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                {link.icon} {link.name}
              </Link>
            ),
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-xl transition-all font-bold"
            >
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-xl transition-all font-bold shadow-lg shadow-blue-100"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-slate-900 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) =>
            link.isExternal ? (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-3"
              >
                {link.icon} {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-3"
              >
                {link.icon} {link.name}
              </Link>
            ),
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full text-center bg-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
