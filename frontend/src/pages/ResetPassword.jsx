import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPasswordService } from "../services/auth.service";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!token) { toast.error("Invalid reset link."); return; }
    setLoading(true);
    try {
      await resetPasswordService(token, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
    ? "w-full p-3 pr-10 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full p-3 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = isDark ? "block text-sm font-medium text-slate-300 mb-1" : "block text-sm font-medium text-gray-700 mb-1";
  const eyeClass = isDark ? "text-slate-400" : "text-gray-400";

  if (!token) return (
    <div className={pg}><div className={`max-w-md w-full rounded-xl p-8 text-center ${card}`}>
      <p className="text-red-500 font-medium mb-4">Invalid or missing reset token.</p>
      <Link to="/forgot-password" className="text-blue-600 font-semibold hover:underline">Request a new reset link</Link>
    </div></div>
  );

  if (success) return (
    <div className={pg}><div className={`max-w-md w-full rounded-xl p-8 text-center ${card}`}>
      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
      <h2 className={`${h} mb-2`}>Password Reset!</h2>
      <p className={isDark ? "text-slate-400" : "text-gray-500"}>Redirecting to login in 3 seconds...</p>
    </div></div>
  );

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-xl p-8 ${card}`}>
        <h2 className={`${h} mb-2`}>Reset your password</h2>
        <p className={`text-sm mb-8 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Choose a strong new password.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"}
                {...register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: "Must include upper, lower, number, special char" } })}
                className={inputClass} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${eyeClass}`}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <span className="text-red-500 text-xs mt-1 block">{errors.newPassword.message}</span>}
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"}
                {...register("confirmPassword", { required: "Required", validate: (v) => v === watch("newPassword") || "Passwords do not match" })}
                className={inputClass} placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${eyeClass}`}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;