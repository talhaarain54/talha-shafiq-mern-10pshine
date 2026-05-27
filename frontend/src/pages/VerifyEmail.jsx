import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { verifyEmailService, resendVerificationService } from "../services/auth.service";
import { handleApiError } from "../utils/handleApiError";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  // ── Resend state (shown on error) ──
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  // ── StrictMode guard: prevent useEffect running twice ──
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invocation in dev.
    // Without this, the token gets consumed on the first run and the
    // second run sees it as "invalid or expired".
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token found.");
        return;
      }

      try {
        const res = await verifyEmailService(token);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "This link is invalid or has expired. Please request a new one."
        );
      }
    };

    verify();
  }, [token, navigate]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setResending(true);
    try {
      await resendVerificationService(resendEmail.trim());
      toast.success("Verification email sent! Check your inbox.");
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
  const h = isDark
    ? "text-2xl font-bold text-white"
    : "text-2xl font-bold text-slate-900";
  const p = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = isDark
    ? "w-full p-2.5 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-xl p-10 text-center ${card}`}>

        {/* ── Loading ── */}
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className={`${h} mb-2`}>Verifying your email...</h2>
            <p className={p}>Please wait.</p>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className={`${h} mb-2`}>Email Verified!</h2>
            <p className={`${p} mb-4`}>{message}</p>
            <p className={`text-sm ${p} mb-4`}>Redirecting to login in 3 seconds...</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <XCircle size={56} className="text-red-500 mx-auto mb-4" />
            <h2 className={`${h} mb-2`}>Verification Failed</h2>
            <p className={`${p} mb-6`}>{message}</p>

            {/* Resend section */}
            <div className={`rounded-xl p-5 mb-4 text-left ${isDark ? "bg-slate-700/50 border border-slate-600" : "bg-slate-50 border border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-blue-500 shrink-0" />
                <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  Get a new verification link
                </p>
              </div>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResend()}
                placeholder="Enter your email"
                className={inputClass}
              />
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full mt-3 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>

            <Link
              to="/login"
              className={`text-sm font-medium hover:underline ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Back to Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;