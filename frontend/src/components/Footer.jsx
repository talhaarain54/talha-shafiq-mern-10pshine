import { useSelector } from "react-redux";

const Footer = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  return (
    <footer className={`py-3 text-center text-xs font-medium tracking-widest uppercase ${
      isDark ? "bg-slate-950 text-slate-500" : "bg-slate-800 text-slate-400"
    }`}>
      © 2026 NoteBase
    </footer>
  );
};

export default Footer;