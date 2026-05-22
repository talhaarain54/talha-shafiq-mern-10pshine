import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginService } from "../services/auth.service";
import { login, setLoading } from "../features/authSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      handleApiError(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Login to NoteBase
        </h2>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5 h-5 mr-2"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {/* This wrapper div must be relative and have mt-1 */}
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className="w-full p-2 pr-10 border border-gray-300 rounded focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                /* top-1/2 and -translate-y-1/2 will now perfectly center against the p-2 input */
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New user?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
