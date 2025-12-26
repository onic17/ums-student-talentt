import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addExperienceAPI, deleteExperienceAPI, getCurrentUserAPI } from '../../utils/api';
import { Plus, Trash2, Briefcase, Calendar } from 'lucide-react';
import { Experience } from '../../contexts/TalentContext';

export default function ExperienceSection() {
  const { token } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setInitialLoading(true);
      try {
        const profile = await getCurrentUserAPI(token);
        const exps = (profile.experiences || []).map(exp => ({
          id: String(exp.id),
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description,
          current: exp.current,
        }));
        setExperiences(exps);
      } catch (err) {
        console.error('Failed to load experiences', err);
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [token]);

  if (!token) {
    return <p className="text-gray-600">Please login to manage experience.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const newExperience = await addExperienceAPI(token, {
        ...formData,
        endDate: formData.current ? null : formData.endDate,
      });
      setExperiences([...experiences, { ...newExperience, id: String(newExperience.id) }]);
      setFormData({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expId: string) => {
    if (!token) return;
    
    try {
      await deleteExperienceAPI(token, expId);
      setExperiences(experiences.filter(e => e.id !== expId));
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-2xl text-gray-900">Experience</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Frontend Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Tech Startup"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Start Date</label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">End Date</label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={formData.current}
                  required={!formData.current}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">I currently work here</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe your responsibilities and achievements..."
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Experience'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {initialLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-600">Loading experience...</div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No experience added yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Add your first experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map(exp => (
            <div
              key={exp.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1">
                  <h4 className="text-xl text-gray-900 mb-1">{exp.title}</h4>
                  <p className="text-gray-600 mb-2">{exp.company}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                    {exp.current && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
