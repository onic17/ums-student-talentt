import { Link } from 'react-router-dom';
import { Talent } from '../contexts/TalentContext';
import { MapPin, Briefcase, Award, ArrowUpRight, Sparkles } from 'lucide-react';

interface TalentCardProps {
  talent: Talent;
}

export default function TalentCard({ talent }: TalentCardProps) {
  return (
    <Link
      to={`/talents/${talent.id}`}
      className="relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
    >
      <div className="relative h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.2),transparent_20%)]" />
        <img
          src={talent.avatar}
          alt={talent.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(talent.name)}`;
          }}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 text-white/80 text-xs inline-flex items-center gap-1 px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          New
        </div>
      </div>

      <div className="p-6 pt-16">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xl text-gray-900 mb-1">{talent.name}</h3>
            <p className="text-emerald-600 text-sm">{talent.major}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{talent.bio}</p>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>UMS - Year {talent.year}</span>
        </div>

        {/* Skills */}
        {talent.skills.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-xs uppercase tracking-wide text-gray-500">Top Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {talent.skills.slice(0, 3).map(skill => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-white text-emerald-700 border border-emerald-100 text-xs rounded-full shadow-sm"
                >
                  {skill.name}
                </span>
              ))}
              {talent.skills.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{talent.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Experience Count */}
        {talent.experiences.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Briefcase className="w-4 h-4" />
            <span>{talent.experiences.length} Experience{talent.experiences.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
