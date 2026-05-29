import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Feather, LayoutGrid, Zap } from "lucide-react";
import LogoFile from "../assets/logo.svg";

export default function Home() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isDark = useSelector((s) => s.theme.mode === "dark");

  const features = [
    {
      title: "Clean Slate Architecture",
      description: "A distraction-free writing environment engineered to help you focus on your core ideas.",
      icon: <Feather className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Dynamic Grid System",
      description: "Your notes are automatically organized in a high-performance bento-grid for quick access.",
      icon: <LayoutGrid className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Engineered for Clarity",
      description: "NoteBase strips away the noise, leaving only what matters: your knowledge database.",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
    },
  ];

  return (
    <div className={isDark ? "bg-slate-900" : "bg-white"}>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <div className={`min-h-screen mt-8 flex flex-col items-center justify-center p-6 font-sans relative ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}>

        {/* Dot grid background */}
        <div className={`absolute inset-0 z-0 pointer-events-none ${
          isDark
            ? "opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:20px_20px]"
            : "opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:20px_20px]"
        }`} />

        <div className="relative z-10 w-full max-w-4xl text-center px-4">

          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img src={LogoFile} alt="NoteBase Logo" className="w-48 h-48" />
          </div>

          {/* Heading */}
          <h1 className={`text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Minimum clutter. <br />
            <span className="text-blue-500">Maximum focus.</span>
          </h1>

          {/* Subheading */}
          <p className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            NoteBase strips away the noise so you can focus on what matters.
            Your notes, organized by logic.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/signup"
                  className={`px-12 py-3 font-bold rounded-2xl transition-all active:scale-95 text-lg border-2 ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300"
                  }`}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ─────────────────────────────────────── */}
      <section className={`py-24 px-6 border-t ${
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
      }`} id="features">
        <div className="max-w-6xl mx-auto">

          {/* Section heading */}
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-3">
              Features
            </h2>
            <h3 className={`text-3xl md:text-4xl font-black ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Built for the modern thinker.
            </h3>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md group ${
                  isDark
                    ? "bg-slate-800 border-slate-700 hover:border-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-400"
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                  isDark
                    ? "bg-blue-500/10 group-hover:bg-blue-500/20"
                    : "bg-blue-50 group-hover:bg-blue-100"
                }`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h4 className={`text-xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {feature.title}
                </h4>

                {/* Description */}
                <p className={`leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}