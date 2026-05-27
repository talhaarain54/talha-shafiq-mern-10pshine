import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { resendVerificationService } from "../services/auth.service";
import { handleApiError } from "../utils/handleApiError";
import { MailOpen, RefreshCcw, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const EmailNotVerified = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const location = useLocation();
  const navigate = useNavigate();

  // Email is passed via navigate state from Login page
  const email = location.state?.email || "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("No email address found. Please go back and try logging in again.");
      return;
    }
    setResending(true);
    try {
      await resendVerificationService(email);
      setResent(true);
      toast.success("Verification email sent!");
    } catch (err) {
      handleApiError(err);
    } finally {
      setResending(false);
    }
  };

  const pg = isDark
    ? "min-h-screen flex items-center justify-center bg-slate-900 px-4"
    : "min-h-screen flex items-center justify-center bg-gray-50 px-4";

  const card = isDark
    ? "bg-slate-800 border border-slate-700"
    : "bg-white shadow-md";

  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subColor = isDark ? "text-slate-400" : "text-slate-500";
  const emailPillBg = isDark
    ? "bg-slate-700 border border-slate-600 text-slate-200"
    : "bg-slate-100 border border-slate-200 text-slate-700";
  const dividerColor = isDark ? "border-slate-700" : "border-slate-100";

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-2xl p-10 text-center ${card}`}>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isDark ? "bg-amber-500/10" : "bg-amber-50"
        }`}>
          <MailOpen size={36} className="text-amber-500" />
        </div>

        {/* Heading */}
        <h1 className={`text-2xl font-black mb-2 ${headingColor}`}>
          Verify your email
        </h1>
        <p className={`text-sm mb-5 ${subColor}`}>
          Your account is not yet activated. Please check your inbox and click the verification link we sent.
        </p>

        {/* Email pill */}
        {email && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${emailPillBg}`}>
            <MailOpen size={14} className="shrink-0" />
            {email}
          </div>
        )}

        <hr className={`mb-6 ${dividerColor}`} />

        {/* Resend block */}
        {resent ? (
          <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4 ${
            isDark ? "bg-green-500/10 border border-green-500/30" : "bg-green-50 border border-green-200"
          }`}>
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <p className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
              New link sent! Check your inbox.
            </p>
          </div>
        ) : (
          <p className={`text-sm mb-3 ${subColor}`}>
            Didn't get the email? Check your spam folder or resend it.
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition mb-3"
        >
          <RefreshCcw size={16} className={resending ? "animate-spin" : ""} />
          {resending ? "Sending..." : resent ? "Resend Again" : "Resend Verification Email"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
            isDark
              ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <p className={`mt-6 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          Wrong account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline font-medium">
            Create a new one
          </Link>
        </p>

      </div>
    </div>
  );
};

export default EmailNotVerified;
