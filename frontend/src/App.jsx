import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import FooterLayout from "./components/FooterLayout";
import NoteEditor from "./pages/NoteEditor";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Routes>
      <Route element={<FooterLayout />}>
        {/* Universal Routes */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes:id" element={<NoteEditor />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback Route 404 Page not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
