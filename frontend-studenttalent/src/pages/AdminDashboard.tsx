import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ToggleRight,
  ToggleLeft,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  getAllStudentsAPI,
  deactivateStudentAPI,
  activateStudentAPI,
  UserProfile,
} from "../utils/api";

export default function AdminDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<
    (UserProfile & { is_active?: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // You can add a check here if you have admin role info
    // For now, we'll just allow access to admin endpoints
  }, [isAuthenticated, navigate]);

  // Load students
  useEffect(() => {
    if (!token) return;
    loadStudents();
  }, [token]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllStudentsAPI(token!);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (
    studentId: number,
    currentStatus: boolean
  ) => {
    try {
      setToggling(studentId);
      if (currentStatus) {
        await deactivateStudentAPI(token!, studentId);
      } else {
        await activateStudentAPI(token!, studentId);
      }
      // Update local state
      setStudents(
        students.map((s) =>
          s.userId === studentId ? { ...s, is_active: !currentStatus } : s
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to update student status");
    } finally {
      setToggling(null);
    }
  };

  const majors = Array.from(new Set(students.map((s) => s.major))).sort();

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === "" ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajor = filterMajor === "" || student.major === filterMajor;
    return matchesSearch && matchesMajor;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-emerald-100 mt-2">
                Manage and moderate student profiles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {students.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2">Active Profiles</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {students.filter((s) => s.is_active !== false).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2">Deactivated</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {students.filter((s) => s.is_active === false).length}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Students
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Major
              </label>
              <select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Majors</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-slate-900">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
              <p className="text-gray-600 dark:text-slate-300">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-slate-300">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 dark:bg-slate-950 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Major
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Year
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const isActive = student.is_active !== false;
                    return (
                      <tr
                        key={student.userId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-950"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-slate-100">
                                {student.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {student.major}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {student.year || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleToggleStatus(student.userId, isActive)
                            }
                            disabled={toggling === student.userId}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                              isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {toggling === student.userId ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600 dark:text-slate-300">
          <p>
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      </div>
    </div>
  );
}
