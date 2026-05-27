import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPasswordService } from "../services/auth.service";
import { handleApiError } from "../utils/handleApiError";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPasswordService(data.email);
      setSubmitted(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const pg = isDark ? "min-h-screen flex items-center justify-center bg-slate-900 px-4" : "min-h-screen flex items-center justify-center bg-gray-50 px-4";
  const card = isDark ? "bg-slate-800 border border-slate-700" : "bg-white shadow-md";
  const h = isDark ? "text-2xl font-bold text-white" : "text-2xl font-bold text-gray-900";
  const inputClass = isDark
    ? "w-full p-3 border border-slate-600 rounded-lg mt-1 bg-slate-700 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full p-3 border border-gray-300 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500";

  if (submitted) {
    return (
      <div className={pg}>
        <div className={`max-w-md w-full rounded-xl p-8 text-center ${card}`}>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-blue-600" />
          </div>
          <h2 className={h}>Check your email</h2>
          <p className={`text-sm my-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            If <strong>{getValues("email")}</strong> is registered, you'll receive a reset link shortly.
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-xl p-8 ${card}`}>
        <div className="mb-6">
          <Link to="/login" className={`inline-flex items-center gap-1 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
        <h2 className={h}>Forgot your password?</h2>
        <p className={`text-sm mt-2 mb-8 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={isDark ? "block text-sm font-medium text-slate-300 mb-1" : "block text-sm font-medium text-gray-700 mb-1"}>
              Email address
            </label>
            <input type="email" {...register("email", { required: "Email is required" })} className={inputClass} placeholder="you@example.com" />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;