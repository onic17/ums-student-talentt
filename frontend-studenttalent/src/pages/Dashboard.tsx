import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSection from '../component/dashboard/ProfileSection';
import SkillsSection from '../component/dashboard/SkillsSection';
import ExperienceSection from '../component/dashboard/ExperienceSection';
import { User, Award, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'experience'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'skills' as const, label: 'Skills', icon: Award },
    { id: 'experience' as const, label: 'Experience', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 dark:text-slate-100 mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600 dark:text-slate-300">Manage your profile and showcase your talents</p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
              }}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-3xl mb-2">{user?.name}</h2>
              <p className="text-blue-100 text-lg">{user?.major}</p>
              <p className="text-blue-100">Year {user?.year}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-8 dark:bg-slate-900">
          <div className="border-b border-gray-200 dark:border-slate-800">
            <nav className="flex -mb-px">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'skills' && <SkillsSection />}
            {activeTab === 'experience' && <ExperienceSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
