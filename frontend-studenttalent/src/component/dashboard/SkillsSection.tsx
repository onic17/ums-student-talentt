import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addSkillAPI, deleteSkillAPI, getCurrentUserAPI } from '../../utils/api';
import { Plus, Trash2, Award } from 'lucide-react';
import { Skill } from '../../contexts/TalentContext';

export default function SkillsSection() {
  const { user, token } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: 'Beginner' as const,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setInitialLoading(true);
      try {
        const profile = await getCurrentUserAPI(token);
        const profileSkills = (profile.skills || []).map(s => ({
          id: String(s.id),
          name: s.name,
          level: s.level,
        }));
        setSkills(profileSkills);
      } catch (err) {
        console.error('Failed to load skills', err);
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [token]);

  if (!token) {
    return <p className="text-gray-600">Please login to manage skills.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const newSkill = await addSkillAPI(token, formData);
      setSkills([...skills, { ...newSkill, id: String(newSkill.id) }]);
      setFormData({ name: '', level: 'Beginner' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!token) return;
    
    try {
      await deleteSkillAPI(token, skillId);
      setSkills(skills.filter(s => s.id !== skillId));
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-2xl text-gray-900">Skills</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Skill
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Skill Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Python, UI Design"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Skill'}
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
        <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-600">Loading skills...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No skills added yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map(skill => (
            <div
              key={skill.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <h4 className="text-lg text-gray-900 mb-1">{skill.name}</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {skill.level}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: 
                      skill.level === 'Expert' ? '100%' :
                      skill.level === 'Advanced' ? '75%' :
                      skill.level === 'Intermediate' ? '50%' : '25%'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
