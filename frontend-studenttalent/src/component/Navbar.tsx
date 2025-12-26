import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  GraduationCap,
  LogOut,
  User,
  Home,
  Users,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/talents", label: "Talents", icon: Users },
    ...(isAuthenticated
      ? [{ to: "/dashboard", label: "Dashboard", icon: User }]
      : []),
    ...(isAuthenticated && user?.isAdmin
      ? [{ to: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 dark:bg-slate-950 dark:shadow-none dark:border-b dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-emerald-300" />
            <span className="text-lg sm:text-xl text-gray-900 dark:text-slate-100 whitespace-nowrap">
              UMS Talent
            </span>
          </Link>

          {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  } dark:${
                    isActive(link.to)
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-slate-700">
                <div className="hidden md:block text-right">
                  <div className="text-sm text-gray-900 dark:text-slate-100">{user?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{user?.major}</div>
                </div>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-600"
                />
                <button
                  onClick={logout}
                  className="p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-red-500/10"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden border-t border-gray-200 pt-4 pb-6 space-y-4 dark:border-slate-800">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(link.to)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    } dark:${
                      isActive(link.to)
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center justify-between">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
                    />
                    <div>
                      <div className="text-sm text-gray-900 dark:text-slate-100">{user?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{user?.major}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
