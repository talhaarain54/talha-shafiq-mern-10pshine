import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupService, resendVerificationService } from "../services/auth.service";
import { setLoading } from "../features/authSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const [showPassword, setShowPassword] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState(null);
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    try {
      await signupService(data);
      setSignedUpEmail(data.email);
      toast.success("Account created! Check your email.");
    } catch (err) {
      handleApiError(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResend = async () => {
    if (!signedUpEmail) return;
    setResending(true);
    try {
      await resendVerificationService(signedUpEmail);
      toast.success("Verification email resent!");
    } catch (err) {
      handleApiError(err);
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/google`;
  };

  const pg = isDark ? "min-h-screen flex items-center justify-center bg-slate-900 px-4" : "min-h-screen flex items-center justify-center bg-gray-50 px-4";
  const card = isDark ? "bg-slate-800 border border-slate-700" : "bg-white shadow-md";
  const h = isDark ? "text-2xl font-bold text-center text-white mb-8" : "text-2xl font-bold text-center text-gray-800 mb-8";
  const label = isDark ? "block text-sm font-medium text-slate-300" : "block text-sm font-medium text-gray-700";
  const input = isDark
    ? "w-full p-2 border border-slate-600 rounded mt-1 bg-slate-700 text-white placeholder:text-slate-400 outline-none focus:ring-blue-500"
    : "w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 outline-none";

  // ── Verify Email Screen ──
  if (signedUpEmail) {
    return (
      <div className={pg}>
        <div className={`max-w-md w-full rounded-lg p-8 text-center ${card}`}>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-blue-600" />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Check your email</h2>
          <p className={`mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>We sent a verification link to</p>
          <p className="font-bold text-blue-600 mb-6">{signedUpEmail}</p>
          <p className={`text-sm mb-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
          <button onClick={handleResend} disabled={resending}
            className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-semibold disabled:opacity-50 mb-4">
            {resending ? "Sending..." : "Resend verification email"}
          </button>
          <button onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Signup Form ──
  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-lg p-8 ${card}`}>
        <h2 className={h}>Create an Account</h2>

        <button type="button" onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center border p-2 rounded-lg transition ${isDark ? "border-slate-600 hover:bg-slate-700 text-slate-200" : "border-gray-300 hover:bg-gray-50"}`}>
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5 mr-2" alt="Google" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className={`flex-1 h-px ${isDark ? "bg-slate-600" : "bg-gray-200"}`} />
          <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-400"}`}>or</span>
          <div className={`flex-1 h-px ${isDark ? "bg-slate-600" : "bg-gray-200"}`} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={label}>Full Name</label>
            <input {...register("name", { required: "Name is required", minLength: { value: 3, message: "Min 3 chars" } })}
              className={`${input} ${errors.name ? "border-red-500" : ""}`} placeholder="Talha Arain" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" {...register("email", { required: "Email is required" })}
              className={`${input} ${errors.email ? "border-red-500" : ""}`} placeholder="you@example.com" />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className={label}>Password</label>
            <div className="relative mt-1">
              <input type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Min 8 characters" },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: "Must include Upper, Lower, Number, and Special char" },
                })}
                className={`${input} pr-10 ${errors.password ? "border-red-500" : ""}`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center ${isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"}`}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>
          <button disabled={loading} type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition font-semibold">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className={`mt-4 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;