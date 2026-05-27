import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { verifyEmailService } from "../services/auth.service";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

useEffect(() => {
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

  const pg = isDark ? "min-h-screen flex items-center justify-center bg-slate-900 px-4" : "min-h-screen flex items-center justify-center bg-gray-50 px-4";
  const card = isDark ? "bg-slate-800 border border-slate-700" : "bg-white shadow-md";
  const h = isDark ? "text-2xl font-bold text-white" : "text-2xl font-bold text-slate-900";
  const p = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-xl p-10 text-center ${card}`}>
        {status === "loading" && (
          <><Loader2 size={48} className="text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className={`${h} mb-2`}>Verifying your email...</h2><p className={p}>Please wait.</p></>
        )}
        {status === "success" && (
          <><CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className={`${h} mb-2`}>Email Verified!</h2>
          <p className={`${p} mb-4`}>{message}</p>
          <p className={`text-sm ${p} mb-4`}>Redirecting to login in 3 seconds...</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Go to Login</Link></>
        )}
        {status === "error" && (
          <><XCircle size={56} className="text-red-500 mx-auto mb-4" />
          <h2 className={`${h} mb-2`}>Verification Failed</h2>
          <p className={`${p} mb-6`}>{message}</p>
          <Link to="/signup" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Back to Signup</Link></>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;