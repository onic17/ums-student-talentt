from __future__ import annotations

from datetime import date

from django.conf import settings
from django.db import transaction
from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import (
    Experience,
    PortfolioLink,
    Profile,
    ProfileSkill,
    Project,
    Skill,
    User,
)

DEFAULT_PASSWORD = "Talent@123"

SAMPLE_STUDENTS = [
    {
        "email": "putri.anindia@student.ums.ac.id",
        "first_name": "Putri",
        "major": "Teknologi Informasi",
        "year": 2023,
        "bio": (
            "Putri menyukai pengalaman membuat aplikasi berbasis React dan Tailwind. "
            "Dia aktif mengerjakan proyek kampus yang menghubungkan data akademik."
        ),
        "linkedin": "https://linkedin.com/in/putri-anindia",
        "github": "https://github.com/putrianindia",
        "website": "https://putrianindia.dev",
        "skills": [
            {"name": "React", "level": "Advanced"},
            {"name": "TypeScript", "level": "Advanced"},
            {"name": "Tailwind CSS", "level": "Advanced"},
            {"name": "Node.js", "level": "Intermediate"},
        ],
        "experiences": [
            {
                "title": "Frontend Engineer Intern",
                "company": "TechLab UMS",
                "start_date": date(2022, 9, 1),
                "end_date": date(2023, 6, 1),
                "current": False,
                "description": "Mengembangkan dashboard monitoring kegiatan kemahasiswaan dengan React.",
            },
            {
                "title": "Product Engineer",
                "company": "Freelance",
                "start_date": date(2023, 7, 1),
                "end_date": None,
                "current": True,
                "description": "Membantu UKM digital menyusun platform profil berbasis Next.js.",
            },
        ],
        "projects": [
            {
                "title": "Smart Campus Portal",
                "description": "Portal terpadu untuk melihat jadwal kuliah, nilai, dan kegiatan organisasi.",
                "link": "https://github.com/putrianindia/smart-campus",
            },
            {
                "title": "UMS Event Finder",
                "description": "Aplikasi mobile-first untuk menampilkan agenda kampus dengan filter lokasi.",
                "link": "https://github.com/putrianindia/ums-event-finder",
            },
        ],
        "portfolio": [
            "https://github.com/putrianindia",
            "https://dribbble.com/putrianindia",
        ],
    },
    {
        "email": "rafi.pradana@student.ums.ac.id",
        "first_name": "Rafi",
        "major": "Sistem Informasi",
        "year": 2024,
        "bio": (
            "Rafi fokus pada infrastruktur data dan memastikan analitik kampus berjalan dengan kuat."
        ),
        "linkedin": "https://linkedin.com/in/rafi-pradana",
        "github": "https://github.com/rafi-pradana",
        "website": "https://rafipradana.id",
        "skills": [
            {"name": "Django", "level": "Advanced"},
            {"name": "PostgreSQL", "level": "Advanced"},
            {"name": "REST", "level": "Advanced"},
            {"name": "Docker", "level": "Intermediate"},
        ],
        "experiences": [
            {
                "title": "Backend Intern",
                "company": "UMS DataOps",
                "start_date": date(2023, 3, 1),
                "end_date": date(2023, 12, 1),
                "current": False,
                "description": "Membuat API autentikasi dan manajemen aset mahasiswa.",
            },
        ],
        "projects": [
            {
                "title": "Attendance API",
                "description": "API berbasis Django yang memadukan absensi daring dari berbagai fakultas.",
                "link": "https://github.com/rafi-pradana/attendance-api",
            },
        ],
        "portfolio": [
            "https://github.com/rafi-pradana",
        ],
    },
    {
        "email": "dewi.kartika@student.ums.ac.id",
        "first_name": "Dewi",
        "major": "Desain Komunikasi Visual",
        "year": 2022,
        "bio": (
            "Dewi menggabungkan seni dan teknologi untuk membuat pengalaman pengguna yang imersif."
        ),
        "linkedin": "https://linkedin.com/in/dewi-kartika",
        "github": "https://github.com/dewi-kartika",
        "website": "https://dewikartika.studio",
        "skills": [
            {"name": "Figma", "level": "Expert"},
            {"name": "Illustrator", "level": "Expert"},
            {"name": "UX Research", "level": "Advanced"},
        ],
        "experiences": [
            {
                "title": "Visual Designer Intern",
                "company": "Komik Project",
                "start_date": date(2022, 1, 1),
                "end_date": date(2022, 12, 1),
                "current": False,
                "description": "Menghasilkan aset visual untuk kampanye digital mahasiswa.",
            },
        ],
        "projects": [
            {
                "title": "Campus Stories",
                "description": "Koleksi cerita kampus dengan ilustrasi interaktif dan sound design sederhana.",
                "link": "https://dribbble.com/shots/12345678-campus-stories",
            },
        ],
        "portfolio": [
            "https://dribbble.com/dewikartika",
            "https://behance.net/dewi-kartika",
        ],
    },
]


def create_demo_profiles():
    """Insert sample students if the database is empty (development only)."""
    if not settings.DEBUG:
        return
    if Profile.objects.exists():
        return

    with transaction.atomic():
        for student in SAMPLE_STUDENTS:
            if User.objects.filter(email=student["email"]).exists():
                continue

            user = User.objects.create_user(
                email=student["email"],
                password=student.get("password", DEFAULT_PASSWORD),
            )
            user.first_name = student.get("first_name", "")
            user.save()

            profile = Profile.objects.create(
                user=user,
                prodi=student["major"],
                entry_year=student["year"],
                about=student["bio"],
                linkedin=student.get("linkedin", ""),
                github=student.get("github", ""),
                website=student.get("website", ""),
                is_active=True,
            )

            for skill in student.get("skills", []):
                skill_obj, _ = Skill.objects.get_or_create(name=skill["name"])
                ProfileSkill.objects.create(
                    profile=profile,
                    skill=skill_obj,
                    level=skill.get("level", "Intermediate"),
                )

            for exp in student.get("experiences", []):
                Experience.objects.create(
                    profile=profile,
                    title=exp["title"],
                    company=exp["company"],
                    start_date=exp["start_date"],
                    end_date=exp.get("end_date"),
                    is_current=exp.get("current", False),
                    description=exp.get("description", ""),
                )

            for project in student.get("projects", []):
                Project.objects.create(
                    profile=profile,
                    title=project["title"],
                    description=project.get("description", ""),
                    link=project.get("link", ""),
                )

            for link in student.get("portfolio", []):
                PortfolioLink.objects.create(profile=profile, url=link)


@receiver(post_migrate)
def ensure_demo_data(sender, **kwargs):
    if sender.name != "api":
        return
    create_demo_profiles()
