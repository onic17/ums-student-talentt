from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    """Custom manager so email becomes the login identifier."""

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        # Fall back to email as username to satisfy AbstractUser's username field
        extra_fields.setdefault("username", email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('mahasiswa', 'Mahasiswa'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='mahasiswa')
    photo_profile = models.TextField(null=True, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    nim = models.CharField(max_length=15, unique=True, blank=True, null=True)
    prodi = models.CharField(max_length=100, blank=True)  # Mapped to 'major'
    entry_year = models.IntegerField(null=True, blank=True)  # Mapped to 'year'
    about = models.TextField(blank=True)  # Mapped to 'bio'
    is_active = models.BooleanField(default=True)  # Admin can deactivate profiles

    # Social Media
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.user.username

class ProfileSkill(models.Model):
    LEVEL_CHOICES = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Expert', 'Expert'),
    )
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='profile_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Intermediate')

    def __str__(self):
        return f"{self.profile.user.username} - {self.skill.name}"

class SkillEndorsement(models.Model):
    profile_skill = models.ForeignKey(ProfileSkill, on_delete=models.CASCADE, related_name='endorsements')
    endorser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_endorsements')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profile_skill', 'endorser')

    def __str__(self):
        return f"{self.endorser.email} endorsed {self.profile_skill}"

class Experience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class PortfolioLink(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='portfolio_links')
    url = models.URLField()

    def __str__(self):
        return self.url

class Project(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    link = models.URLField(blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title
