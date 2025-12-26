import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTalents, Talent } from "../contexts/TalentContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Download,
  ArrowLeft,
  QrCode,
  Share2,
} from "lucide-react";
import { generateCV } from "../utils/pdfGenerator";
import { endorseSkillAPI, unendorseSkillAPI } from "../utils/api";
import * as QRCode from "qrcode";

export default function TalentDetail() {
  const { id } = useParams<{ id: string }>();
  const { getTalentById } = useTalents();
  const { token, isAuthenticated } = useAuth();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [endorseLoading, setEndorseLoading] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    loadTalent();
  }, [id]);

  const loadTalent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getTalentById(id);
      setTalent(data);
    } catch (error) {
      console.error("Failed to load talent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!talent) return;
    try {
      await generateCV(talent);
    } catch (error) {
      console.error("Failed to generate CV:", error);
    }
  };

  const profileUrl = id
    ? `${window.location.origin}/talents/${id}`
    : window.location.href;

  const ensureQrDataUrl = async () => {
    if (qrDataUrl) return qrDataUrl;
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 512,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      return dataUrl;
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!talent) return;
    try {
      const dataUrl = await ensureQrDataUrl();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${talent.name.replace(/\s+/g, "_")}_QR.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download QR:", error);
    }
  };

  const handleShareQR = async () => {
    if (!talent) return;
    setShareMessage("");
    try {
      const dataUrl = await ensureQrDataUrl();
      if (!dataUrl) return;
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([blob], `${talent.name}_QR.png`, {
        type: blob.type,
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${talent.name} - UMS Talent`,
          text: "Scan this QR to view the profile.",
          files: [file],
        });
        setShareMessage("QR shared.");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `${talent.name} - UMS Talent`,
          url: profileUrl,
        });
        setShareMessage("Profile link shared.");
        return;
      }

      await navigator.clipboard.writeText(profileUrl);
      setShareMessage("Profile link copied.");
    } catch (error) {
      console.error("Failed to share QR:", error);
      setShareMessage("Share failed.");
    }
  };

  const handleToggleEndorsement = async (skillId: string, endorsed?: boolean) => {
    if (!talent || !token) return;
    try {
      setEndorseLoading(skillId);
      const data = endorsed
        ? await unendorseSkillAPI(token, talent.id, skillId)
        : await endorseSkillAPI(token, talent.id, skillId);
      setTalent({
        ...talent,
        skills: talent.skills.map((skill) =>
          skill.id === skillId
            ? {
                ...skill,
                endorsements_count: data.endorsements_count ?? 0,
                endorsed_by_me: data.endorsed_by_me ?? !endorsed,
              }
            : skill
        ),
      });
    } catch (error) {
      console.error("Failed to update endorsement:", error);
    } finally {
      setEndorseLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-4">Talent not found</h2>
          <Link to="/talents" className="text-blue-600 hover:text-blue-700">
            Back to Talents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Link
            to="/talents"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-all duration-200 hover:gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Talents
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-lg opacity-75"></div>
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm mb-4 md:ml-0">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {talent.experiences.length > 0 ? "Active" : "Available"}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                {talent.name}
              </h1>
              <p className="text-2xl text-blue-100 mb-6 font-medium">
                {talent.major}
              </p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start text-blue-100 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">
                    Universitas Muhammadiyah Surakarta
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Year {talent.year}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {talent.linkedin && (
                  <a
                    href={talent.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 group"
                  >
                    <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">LinkedIn</span>
                  </a>
                )}
                {talent.github && (
                  <a
                    href={talent.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 group"
                  >
                    <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">GitHub</span>
                  </a>
                )}
                {talent.website && (
                  <a
                    href={talent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 group"
                  >
                    <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Website</span>
                  </a>
                )}
                <button
                  onClick={handleDownloadCV}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>Download CV</span>
                </button>
                <button
                  onClick={handleDownloadQR}
                  disabled={qrLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 font-semibold disabled:opacity-60"
                >
                  <QrCode className="w-5 h-5" />
                  <span>{qrLoading ? "Generating..." : "Download QR"}</span>
                </button>
                <button
                  onClick={handleShareQR}
                  disabled={qrLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 font-semibold disabled:opacity-60"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share QR</span>
                </button>
              </div>
              {shareMessage && (
                <p className="mt-3 text-sm text-blue-100">{shareMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {talent.bio}
              </p>
            </section>

            {/* Experience */}
            {talent.experiences.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Experience
                  </h2>
                  <span className="ml-auto px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {talent.experiences.length}
                  </span>
                </div>

                <div className="space-y-6">
                  {talent.experiences.map((exp, idx) => (
                    <div key={exp.id} className="relative">
                      {idx !== talent.experiences.length - 1 && (
                        <div className="absolute left-0 top-16 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-100"></div>
                      )}
                      <div className="pl-8 relative">
                        <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {exp.title}
                            </h3>
                            <div className="text-blue-600 font-semibold mb-2">
                              {exp.company}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {exp.startDate} -{" "}
                                {exp.current ? "Present" : exp.endDate}
                              </span>
                              {exp.current && (
                                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {talent.portfolio.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Portfolio
                  </h2>
                  <span className="ml-auto px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {talent.portfolio.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {talent.portfolio.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 group-hover:text-purple-600 font-semibold truncate">
                          {link}
                        </p>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-purple-600 rotate-180 transition-all" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {talent.skills.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100/50 lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                </div>

                <div className="space-y-5">
                  {talent.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">
                          {skill.name}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {skill.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>
                          {skill.endorsements_count ?? 0} endorsements
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleEndorsement(
                              skill.id,
                              skill.endorsed_by_me
                            )
                          }
                          disabled={!isAuthenticated || endorseLoading === skill.id}
                          className={`px-3 py-1 rounded-full border transition-colors ${
                            skill.endorsed_by_me
                              ? "border-emerald-500 text-emerald-600"
                              : "border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                          } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {skill.endorsed_by_me ? "Endorsed" : "Endorse"}
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{
                            width:
                              skill.level === "Expert"
                                ? "100%"
                                : skill.level === "Advanced"
                                ? "80%"
                                : skill.level === "Intermediate"
                                ? "60%"
                                : "40%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Card */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 text-white rounded-2xl shadow-lg p-6 border border-emerald-400/20 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5" />
                <h3 className="text-xl font-bold">Get in Touch</h3>
              </div>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                Interested in collaborating or learning more? Send an email to
                get in touch.
              </p>
              <a
                href={`mailto:${talent.email}`}
                className="block w-full py-3 px-4 bg-white text-blue-700 text-center rounded-xl hover:bg-blue-50 transition-all duration-200 font-bold hover:shadow-lg"
              >
                Send Email
              </a>
              <div className="mt-4 pt-4 border-t border-blue-400/20">
                <p className="text-xs text-blue-200">📧 {talent.email}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
