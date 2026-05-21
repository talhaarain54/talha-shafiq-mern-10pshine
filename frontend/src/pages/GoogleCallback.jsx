import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken, setUser, setLoading } from "../features/authSlice";
import toast from "react-hot-toast";
import API from "../api/axios";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const initGoogleUser = async () => {
        dispatch(setLoading(true));
        try {
          dispatch(setAccessToken(token));
          const { data } = await API.get("/v1/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(setUser(data.data));

          toast.success("Google Login Successful!");
          navigate("/dashboard");
        } catch (err) {
          console.error("Sync Error:", err);
          toast.error("Profile sync failed.");
          navigate("/login");
        } finally {
          dispatch(setLoading(false));
        }
      };
      initGoogleUser();
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center">
      Authenticating...
    </div>
  );
};

export default GoogleCallback;
