import { Link } from 'react-router-dom';
import { useTalents } from '../contexts/TalentContext';
import { ArrowRight, Sparkles, Users, Award, TrendingUp } from 'lucide-react';
import TalentCard from '../component/TalentCard';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { talents, loading } = useTalents();
  const { isAuthenticated } = useAuth();

  const latestTalents = talents.slice(0, 3);
  const totalStudents = talents.length;
  const skillNames = talents.flatMap(t => (t.skills || []).map(s => s.name));
  const totalSkills = new Set(skillNames).size;
  const totalProjects = talents.reduce(
    (acc, t) => acc + ((t.experiences || []).length),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-blue-100">Discover Top Talent</span>
            </div>
            <h1 className="text-4xl md:text-6xl mb-6 text-white">
              UMS Student Talent Platform
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with talented students from Universitas Muhammadiyah Surakarta. 
              Discover skills, portfolios, and experiences of our brightest minds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/talents"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Browse All Talents
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Join as Student'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl dark:bg-slate-800">
                <Users className="w-8 h-8 text-blue-600 dark:text-emerald-300" />
              </div>
              <div>
                <div className="text-3xl text-gray-900 dark:text-slate-100">
                  {loading ? '...' : `${totalStudents}+`}
                </div>
                <div className="text-gray-600 dark:text-slate-300">Active Students</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-xl dark:bg-slate-800">
                <Award className="w-8 h-8 text-green-600 dark:text-emerald-300" />
              </div>
              <div>
                <div className="text-3xl text-gray-900 dark:text-slate-100">
                  {loading ? '...' : `${Math.max(totalSkills, 0)}+`}
                </div>
                <div className="text-gray-600 dark:text-slate-300">Skills Available</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-100 rounded-xl dark:bg-slate-800">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-emerald-300" />
              </div>
              <div>
                <div className="text-3xl text-gray-900 dark:text-slate-100">
                  {loading ? '...' : `${Math.max(totalProjects, 0)}+`}
                </div>
                <div className="text-gray-600 dark:text-slate-300">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Talents */}
      <section className="py-16 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl text-gray-900 dark:text-slate-100 mb-2">Latest Talents</h2>
              <p className="text-gray-600 dark:text-slate-300">Meet our newest talented students</p>
            </div>
            <Link
              to="/talents"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestTalents.map(talent => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full backdrop-blur-sm text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Build your standout profile
          </div>
          <h2 className="text-3xl md:text-4xl text-white mb-4">
            Ready to Showcase Your Talent?
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-3xl mx-auto">
            Publish your skills, projects, and experience so recruiters can find you faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-slate-900 rounded-full hover:bg-emerald-400 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/talents"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full hover:bg-white/15 transition-all"
            >
              View Talents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
