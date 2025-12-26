const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillPayload {
  id: string | number;
  name: string;
  level: SkillLevel;
  endorsements_count?: number;
  endorsed_by_me?: boolean;
}

export interface ExperiencePayload {
  id: string | number;
  title: string;
  company: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  current: boolean;
}

export interface UserProfile {
  id: number; // profile id
  userId: number;
  name: string;
  email: string;
  major: string;
  year: number | null;
  bio: string;
  avatar: string;
  isAdmin?: boolean;
  is_active?: boolean;
  linkedin?: string;
  github?: string;
  website?: string;
  skills?: SkillPayload[];
  experiences?: ExperiencePayload[];
  portfolio?: string[];
}

const defaultAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=UMS";

async function request(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const data = JSON.parse(text);
      message = data.detail || data.error || JSON.stringify(data);
    } catch (_) {
      // ignore JSON parse error
    }
    throw new Error(message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Helper to get base URL (remove /api from the end)
const BASE_URL = API_BASE_URL.replace('/api', '');

function mapProfileToUser(profile: any): UserProfile {
  let avatarUrl = profile.avatar || defaultAvatar;
  if (avatarUrl && avatarUrl.startsWith('/media/')) {
    avatarUrl = `${BASE_URL}${avatarUrl}`;
  }

  return {
    id: profile.id,
    userId: profile.user_id,
    name: profile.name || "",
    email: profile.email || "",
    major: profile.major || "",
    year: profile.year ?? null,
    bio: profile.bio || "",
    avatar: avatarUrl,
    isAdmin: profile.role === "admin" || profile.is_admin || false,
    is_active: profile.is_active,
    linkedin: profile.linkedin || "",
    github: profile.github || "",
    website: profile.website || "",
    skills: (profile.skills || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      level: s.level,
      endorsements_count: s.endorsements_count ?? 0,
      endorsed_by_me: s.endorsed_by_me ?? false,
    })),
    experiences: (profile.experiences || []).map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      current: exp.current,
    })),
    portfolio: profile.portfolio || [],
  };
}

// Auth APIs
export async function loginAPI(email: string, password: string) {
  const data = await request("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = data.access;
  const user = mapProfileToUser(data.user);

  return { token, refresh: data.refresh, user };
}

export async function registerAPI(userData: any) {
  // Create user
  await request("/users/", {
    method: "POST",
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      name: userData.name,
    }),
  });

  // Login to get token
  const loginResult = await loginAPI(userData.email, userData.password);

  // Optionally update profile info if provided
  if (userData.major || userData.year || userData.bio) {
    await updateProfileAPI(loginResult.token, {
      major: userData.major,
      year: userData.year,
      bio: userData.bio,
    });
    // refresh profile
    const refreshed = await getCurrentUserAPI(loginResult.token);
    return { ...loginResult, user: refreshed };
  }

  return loginResult;
}

export async function getCurrentUserAPI(token: string): Promise<UserProfile> {
  const data = await request("/profiles/me/", { method: "GET" }, token);
  return mapProfileToUser(data);
}

// Talent APIs (public)
export async function getTalentsAPI(): Promise<UserProfile[]> {
  const data = await request("/profiles/");
  // Handle paginated response from ModelViewSet
  const profiles = data.results || data;
  return (Array.isArray(profiles) ? profiles : []).map(mapProfileToUser);
}

export async function getTalentByIdAPI(id: string): Promise<UserProfile> {
  const data = await request(`/profiles/${id}/`);
  return mapProfileToUser(data);
}

// Skills CRUD (current user)
export async function addSkillAPI(
  token: string,
  skill: { name: string; level: SkillLevel }
): Promise<SkillPayload> {
  const data = await request(
    "/skills/",
    {
      method: "POST",
      body: JSON.stringify({
        skill_name: skill.name,
        level: skill.level,
      }),
    },
    token
  );

  return { id: data.id, name: data.name, level: data.level };
}

export async function deleteSkillAPI(token: string, skillId: string | number) {
  await request(`/skills/${skillId}/`, { method: "DELETE" }, token);
  return { success: true };
}

export async function endorseSkillAPI(
  token: string,
  profileId: string | number,
  skillId: string | number
) {
  return request(
    "/skills/endorse/",
    {
      method: "POST",
      body: JSON.stringify({ profile_id: profileId, skill_id: skillId }),
    },
    token
  );
}

export async function unendorseSkillAPI(
  token: string,
  profileId: string | number,
  skillId: string | number
) {
  return request(
    "/skills/endorse/",
    {
      method: "DELETE",
      body: JSON.stringify({ profile_id: profileId, skill_id: skillId }),
    },
    token
  );
}

// Experience CRUD (current user)
export async function addExperienceAPI(
  token: string,
  experience: any
): Promise<ExperiencePayload> {
  const data = await request(
    "/experiences/",
    {
      method: "POST",
      body: JSON.stringify(experience),
    },
    token
  );
  return {
    id: data.id,
    title: data.title,
    company: data.company,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    current: data.current,
  };
}

export async function deleteExperienceAPI(
  token: string,
  expId: string | number
) {
  await request(`/experiences/${expId}/`, { method: "DELETE" }, token);
  return { success: true };
}

// Profile update
export async function updateProfileAPI(
  token: string,
  profileData: Partial<
    Pick<
      UserProfile,
      | "name"
      | "email"
      | "major"
      | "year"
      | "bio"
      | "linkedin"
      | "github"
      | "website"
    >
  > & { avatarFile?: File | null }
) {
  // Fetch current profile to know user id
  const current = await getCurrentUserAPI(token);

  // Update user (name/email)
  const userPayload: any = {};
  if (profileData.name) userPayload.name = profileData.name;
  if (profileData.email) userPayload.email = profileData.email;
  if (Object.keys(userPayload).length > 0) {
    await request(
      `/users/${current.userId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(userPayload),
      },
      token
    );
  }

  if (profileData.avatarFile) {
    const fd = new FormData();
    fd.append("file", profileData.avatarFile);
    await request(
      "/users/me/photo/",
      {
        method: "POST",
        body: fd,
      },
      token
    );
  }

  // Update profile fields
  const profilePayload: any = {};
  if (profileData.major !== undefined) profilePayload.major = profileData.major;
  if (profileData.year !== undefined) profilePayload.year = profileData.year;
  if (profileData.bio !== undefined) profilePayload.bio = profileData.bio;
  if (profileData.linkedin !== undefined)
    profilePayload.linkedin = profileData.linkedin;
  if (profileData.github !== undefined) profilePayload.github = profileData.github;
  if (profileData.website !== undefined)
    profilePayload.website = profileData.website;

  if (Object.keys(profilePayload).length > 0) {
    await request(
      "/profiles/me/",
      {
        method: "PUT",
        body: JSON.stringify(profilePayload),
      },
      token
    );
  }

  const updated = await getCurrentUserAPI(token);
  return updated;
}

// Admin APIs
export async function getAllStudentsAPI(token: string): Promise<UserProfile[]> {
  const data = await request("/admin/students/", { method: "GET" }, token);
  return (data || []).map(mapProfileToUser);
}

export async function toggleStudentStatusAPI(
  token: string,
  userId: number,
  isActive: boolean
) {
  const data = await request(
    `/admin/students/${userId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    },
    token
  );
  return data;
}

export async function deactivateStudentAPI(token: string, userId: number) {
  return toggleStudentStatusAPI(token, userId, false);
}

export async function activateStudentAPI(token: string, userId: number) {
  return toggleStudentStatusAPI(token, userId, true);
}
