import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSelector } from "react-redux";

export default function MainLayout() {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
      <Navbar /> 
      
      <main className="grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}