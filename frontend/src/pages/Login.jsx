import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginService } from "../services/auth.service";
import { login, setLoading } from "../features/authSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_failed") {
      toast.error("Google login failed. Please try again or use email/password.");
    }
  }, []);

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    try {
      const res = await loginService(data);
      dispatch(login({ user: res.data.user, accessToken: res.accessToken }));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        // Navigate to the dedicated "email not verified" page, passing the email
        navigate("/email-not-verified", { state: { email: data.email } });
      } else {
        handleApiError(err);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/google`;
  };

  const pg = isDark
    ? "min-h-screen flex items-center justify-center bg-slate-900 px-4"
    : "min-h-screen flex items-center justify-center bg-gray-100 px-4";
  const card = isDark ? "bg-slate-800 border border-slate-700" : "bg-white shadow-md";
  const h = isDark
    ? "text-2xl font-bold text-center text-white mb-8"
    : "text-2xl font-bold text-center text-gray-800 mb-8";
  const label = isDark
    ? "block text-sm font-medium text-slate-300"
    : "block text-sm font-medium text-gray-700";
  const input = isDark
    ? "w-full p-2 border border-slate-600 rounded mt-1 bg-slate-700 text-white placeholder:text-slate-400 outline-none focus:ring-blue-500"
    : "w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 outline-none";
  const googleBtn = isDark
    ? "w-full flex items-center justify-center border border-slate-600 p-2 rounded-lg hover:bg-slate-700 text-slate-200 transition"
    : "w-full flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition";
  const dividerLine = isDark ? "bg-slate-600" : "bg-gray-200";
  const dividerText = isDark ? "text-slate-400" : "text-gray-400";

  return (
    <div className={pg}>
      <div className={`max-w-md w-full rounded-lg p-8 ${card}`}>
        <h2 className={h}>Login to NoteBase</h2>

        <button type="button" onClick={handleGoogleLogin} className={googleBtn}>
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5 mr-2" alt="Google" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className={`flex-1 h-px ${dividerLine}`} />
          <span className={`text-sm ${dividerText}`}>or</span>
          <div className={`flex-1 h-px ${dividerLine}`} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={input}
              placeholder="you@example.com"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={label}>Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className={`${input} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"
                } flex items-center`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className={`text-sm cursor-pointer ${isDark ? "text-slate-300" : "text-gray-600"}`}
            >
              Remember me for 30 days
            </label>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition font-semibold"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
          New user?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
