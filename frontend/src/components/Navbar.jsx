import { useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react"; 
import LogoFile from "../assets/logo.svg";
import { useSelector } from "react-redux";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);


  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Github", href: "https://github.com/talhaarain54", isExternal: true },
  ];

  return (
    <nav className="absolute top-0 w-full z-50 bg-white/80 backdrop-blur-md md:bg-transparent border-b border-gray-200 md:border-none">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <img src={LogoFile} alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            NoteBase
          </span>
        </div>

        {/* DESKTOP LINKS - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-600 hover:text-blue-700 transition-colors"
            >
              {link.name}
            </a>
          ))}
          {isAuthenticated ? <Link
            to="/login"
            className="bg-slate-100 text-blue-700 hover:bg-blue-100 px-5 py-2 rounded-xl transition-all font-bold"
          >
            Dashboard
          </Link>: 
          <Link
            to="/dashboard"
            className="bg-slate-100 text-blue-700 hover:bg-blue-100 px-5 py-2 rounded-xl transition-all font-bold"
          >
            Dashboard
          </Link>}
        </div>

        {/* MOBILE MENU BUTTON - Hidden on Desktop */}
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-slate-700 border-b border-slate-50 pb-2"
            >
              {link.name}
            </a>
          ))}
          {isAuthenticated ? <Link
            to="/login"
            className="w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link> : 
          <Link
            to="/dashboard"
            className="w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>}
        </div>
      )}
    </nav>
  );
}