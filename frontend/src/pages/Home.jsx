import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Feather, LayoutGrid, Zap } from "lucide-react";
import LogoFile from "../assets/logo.svg";

export default function Home() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const features = [
    {
      title: "Clean Slate Architecture",
      description: "A distraction-free writing environment engineered to help you focus on your core ideas.",
      icon: <Feather className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Dynamic Grid System",
      description: "Your notes are automatically organized in a high-performance bento-grid for quick access.",
      icon: <LayoutGrid className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Engineered for Clarity",
      description: "NoteBase strips away the noise, leaving only what matters: your knowledge database.",
      icon: <Zap className="w-8 h-8 text-blue-600" />,
    },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <div className="min-h-screen mt-8 bg-white flex flex-col items-center justify-center p-6 font-sans relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[20px_20px]"></div>

        <div className="relative z-10 w-full max-w-4xl text-center px-4">
          <div className="flex justify-center mb-2">
            <img src={LogoFile} alt="NoteBase Logo" className="w-48 h-48" />
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
            Minimum clutter. <br />
            <span className="text-blue-600">Maximum focus.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            NoteBase strips away the noise so you can focus on what matters.
            Your notes, organized by logic.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/signup"
                  className="px-12 py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold rounded-2xl transition-all hover:border-slate-300 active:scale-95 text-lg"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="bg-slate-50 py-24 px-6 border-t border-slate-100" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">
              Built for the modern thinker.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                {/* Icon Container */}
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <div className="group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}