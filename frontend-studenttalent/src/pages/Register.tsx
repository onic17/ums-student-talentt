import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const MAJORS = [
  "Teknik Informatika",
  "Teknik Elektro",
  "Teknik Mesin",
  "Teknik Sipil",
  "Teknik Industri",
  "Teknik Kimia",
  "Teknik Arsitektur",
  "Manajemen",
  "Akuntansi",
  "Ekonomi Pembangunan",
  "Sistem Informasi",
  "Sastra Inggris",
  "Hukum",
  "Pendidikan Pancasila",
  "Pendidikan IPA",
  "Pendidikan Matematika",
  "Psikologi",
  "Farmasi",
  "Kesehatan Masyarakat",
  "Keperawatan",
  "Seni Rupa",
  "Desain Komunikasi Visual",
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
    year: new Date().getFullYear(),
    bio: "",
  });
  const [majorSearch, setMajorSearch] = useState("");
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMajorSearch = (value: string) => {
    setMajorSearch(value);
    setShowMajorDropdown(true);
  };

  const handleSelectMajor = (major: string) => {
    setFormData({
      ...formData,
      major: major,
    });
    setMajorSearch("");
    setShowMajorDropdown(false);
  };

  const filteredMajors = MAJORS.filter((major) =>
    major.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        year: parseInt(formData.year.toString()),
        bio: formData.bio,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl text-gray-900 dark:text-slate-100 mb-2">Join UMS Talent</h2>
          <p className="text-gray-600 dark:text-slate-300">
            Create your account and showcase your skills
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-slate-900">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="your.email@student.ums.ac.id"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="major"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Major
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.major || majorSearch}
                      onChange={(e) => handleMajorSearch(e.target.value)}
                      onFocus={() => setShowMajorDropdown(true)}
                      className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="Search or select major..."
                      autoComplete="off"
                      required
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>

                  {showMajorDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
                      {filteredMajors.length > 0 ? (
                        filteredMajors.map((major, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectMajor(major)}
                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-700 hover:text-indigo-600 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
                          >
                            {major}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500 dark:text-slate-400">
                          No majors found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Enrollment Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm text-gray-700 dark:text-slate-200 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
                Short Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Tell us about yourself and your interests..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
