import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TalentProvider } from "./contexts/TalentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TalentList from "./pages/TalentList";
import TalentDetail from "./pages/TalentDetail";
import Navbar from "./component/Navbar";
import ProtectedRoute from "./component/ProtectedRoute";
import AdminProtectedRoute from "./component/AdminProtectedRoute";

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <TalentProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="/talents" element={<TalentList />} />
                <Route path="/talents/:id" element={<TalentDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </TalentProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
