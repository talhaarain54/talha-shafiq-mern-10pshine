import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupService } from "../services/auth.service";
import { login, setLoading } from "../features/authSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff} from "lucide-react";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    try {
      const res = await signupService(data);

      dispatch(
        login({
          user: res.data.user,
          accessToken: res.accessToken,
        }),
      );

      toast.success("Registration successful!");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create an Account
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
              Full Name
            </label>
            <input
              {...register("name", {
                required: "Name is required",
                minLength: { value: 3, message: "Min 3 chars" },
              })}
              className={`w-full p-2 border rounded mt-1 ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && (
              <span className="text-red-500 text-xs">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full p-2 border rounded mt-1 ${errors.email ? "border-red-500" : "border-gray-300"}`}
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
            {/* Move the relative container here so it only wraps the input */}
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message:
                      "Must include Upper, Lower, Number, and Special char",
                  },
                })}
                className={`w-full p-2 pr-10 border rounded focus:ring-blue-500 outline-none transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Using top-1/2 and -translate-y-1/2 will now perfectly center against the input
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
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
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
