import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import NoteEditor from "./pages/NoteEditor";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { logout, setLoading, setUser } from "./features/authSlice";
import { useDispatch } from "react-redux";
import { getMeService } from "./services/auth.service";
import GoogleCallback from "./pages/GoogleCallback";
import MainLayout from "./components/MainLayout";


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const recoverSession = async () => {
      dispatch(setLoading(true));
      try {
        const response = await getMeService();
        dispatch(setUser(response.data));
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };
    recoverSession();
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route element={<MainLayout />}>
          {/* Universal Routes */}
          <Route path="/" element={<Home />} />

          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login-success" element={<GoogleCallback />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes/:id" element={<NoteEditor />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback Route 404 Page not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
