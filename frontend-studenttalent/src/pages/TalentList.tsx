import { useState, useMemo } from 'react';
import { useTalents } from '../contexts/TalentContext';
import TalentCard from '../component/TalentCard';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function TalentList() {
  const { talents, loading } = useTalents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const majors = useMemo(() => Array.from(new Set(talents.map(t => t.major))).sort(), [talents]);
  const years = useMemo(() => Array.from(new Set(talents.map(t => t.year))).sort((a, b) => b - a), [talents]);
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    talents.forEach(talent => talent.skills.forEach(skill => skills.add(skill.name)));
    return Array.from(skills).sort();
  }, [talents]);

  const filteredTalents = useMemo(() => {
    return talents.filter(talent => {
      const matchesSearch =
        searchQuery === '' ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = selectedMajor === '' || talent.major === selectedMajor;
      const matchesYear = selectedYear === '' || talent.year.toString() === selectedYear;
      const matchesSkill = selectedSkill === '' || talent.skills.some(skill => skill.name === selectedSkill);
      return matchesSearch && matchesMajor && matchesYear && matchesSkill;
    });
  }, [talents, searchQuery, selectedMajor, selectedYear, selectedSkill]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMajor('');
    setSelectedYear('');
    setSelectedSkill('');
  };

  const hasActiveFilters = searchQuery || selectedMajor || selectedYear || selectedSkill;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              Discover UMS Talent
            </div>
            <h1 className="text-4xl text-gray-900 dark:text-slate-100 mb-2">Browse Talents</h1>
            <p className="text-lg text-gray-600 dark:text-slate-300">Find the right student by skills, major, or graduation year.</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6">
            <div>
              <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                Search talents
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, major, or bio..."
                className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                Filters
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">All Majors</option>
                  {majors.map(major => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-600 dark:text-slate-300">Active filters:</span>
              <div className="flex flex-wrap gap-2 flex-1">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                    Search: {searchQuery}
                  </span>
                )}
                {selectedMajor && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {selectedMajor}
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    Year {selectedYear}
                  </span>
                )}
                {selectedSkill && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                    {selectedSkill}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-slate-300">Showing {filteredTalents.length} of {talents.length} talents</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl text-gray-900 mb-2">No talents found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map(talent => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
