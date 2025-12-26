import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTalentsAPI, getTalentByIdAPI, UserProfile } from '../utils/api';

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  endorsements_count?: number;
  endorsed_by_me?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  current: boolean;
}

export interface Project {
  id: string;
  title: string;
  image?: string;
  link?: string;
  description?: string;
}

export interface Talent {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  bio: string;
  avatar: string;
  skills: Skill[];
  experiences: Experience[];
  projects?: Project[];
  portfolio: string[];
  linkedin?: string;
  github?: string;
  website?: string;
}

interface TalentContextType {
  talents: Talent[];
  loading: boolean;
  refreshTalents: () => Promise<void>;
  getTalentById: (id: string) => Promise<Talent>;
}

const TalentContext = createContext<TalentContextType | undefined>(undefined);

export function TalentProvider({ children }: { children: ReactNode }) {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTalents();
  }, []);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const data = await getTalentsAPI();
      const mapped = data.map((p: UserProfile) => ({
        id: String(p.id),
        name: p.name,
        email: p.email,
        major: p.major,
        year: p.year || new Date().getFullYear(),
        bio: p.bio,
        avatar: p.avatar,
        skills: (p.skills || []).map((s) => ({
          ...s,
          id: String(s.id),
        })),
        experiences: p.experiences || [],
        projects: (p as any).projects || [],
        portfolio: p.portfolio || [],
        linkedin: p.linkedin,
        github: p.github,
        website: p.website,
      }));
      setTalents(mapped);
    } catch (error) {
      console.error('Failed to load talents:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTalents = async () => {
    await loadTalents();
  };

  const getTalentById = async (id: string) => {
    const p = await getTalentByIdAPI(id);
    return {
      id: String(p.id),
      name: p.name,
      email: p.email,
      major: p.major,
      year: p.year || new Date().getFullYear(),
      bio: p.bio,
      avatar: p.avatar,
      skills: (p.skills || []).map((s) => ({
        ...s,
        id: String(s.id),
      })),
      experiences: p.experiences || [],
      projects: (p as any).projects || [],
      portfolio: p.portfolio || [],
      linkedin: p.linkedin,
      github: p.github,
      website: p.website,
    };
  };

  return (
    <TalentContext.Provider
      value={{
        talents,
        loading,
        refreshTalents,
        getTalentById,
      }}
    >
      {children}
    </TalentContext.Provider>
  );
}

export function useTalents() {
  const context = useContext(TalentContext);
  if (context === undefined) {
    throw new Error('useTalents must be used within a TalentProvider');
  }
  return context;
}
