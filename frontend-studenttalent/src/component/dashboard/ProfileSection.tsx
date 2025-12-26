import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfileAPI } from '../../utils/api';
import { Save, Loader, Link as LinkIcon, Github, Globe, Upload } from 'lucide-react';

export default function ProfileSection() {
  const { user, token, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    major: user?.major || '',
    year: user?.year || new Date().getFullYear(),
    bio: user?.bio || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    website: user?.website || '',
  });
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  // Sync form when user data updates
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      major: user?.major || '',
      year: user?.year || new Date().getFullYear(),
      bio: user?.bio || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      website: user?.website || '',
    });
    setAvatarPreview(user?.avatar || null);
    setAvatarFile(null);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updateProfileAPI(token, { ...formData, avatarFile });
      await refreshUser();
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (!editing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl text-gray-900 dark:text-slate-100">Profile Information</h3>
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Full Name</label>
              <p className="text-gray-900 dark:text-slate-100">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Email</label>
              <p className="text-gray-900 dark:text-slate-100">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Major</label>
              <p className="text-gray-900 dark:text-slate-100">{user?.major}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Year</label>
              <p className="text-gray-900 dark:text-slate-100">{user?.year}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">Bio</label>
            <p className="text-gray-900 dark:text-slate-100">{user?.bio}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl text-gray-900 dark:text-slate-100">Edit Profile</h3>
        <button
          onClick={() => setEditing(false)}
          className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label htmlFor="major" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
              Major
            </label>
            <input
              id="major"
              name="major"
              type="text"
              value={formData.major}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
              Year
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm text-gray-700 dark:text-slate-200 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2">LinkedIn</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2">GitHub</label>
            <div className="relative">
              <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="https://your-portfolio.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
                    }}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">No photo</div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setAvatarPreview(url);
                    } else {
                      setAvatarPreview(user?.avatar || null);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
