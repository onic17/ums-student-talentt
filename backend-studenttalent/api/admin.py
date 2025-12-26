from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, Skill, ProfileSkill, Experience, Project, PortfolioLink


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password', 'username')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'prodi', 'entry_year')
    search_fields = ('user__email', 'user__first_name', 'prodi')
    list_filter = ('entry_year',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ('name',)


@admin.register(ProfileSkill)
class ProfileSkillAdmin(admin.ModelAdmin):
    list_display = ('profile', 'skill', 'level')
    list_filter = ('level',)
    search_fields = ('profile__user__email', 'skill__name')


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('profile', 'title', 'company', 'is_current')
    list_filter = ('is_current',)
    search_fields = ('profile__user__email', 'title', 'company')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('profile', 'title')
    search_fields = ('profile__user__email', 'title')


@admin.register(PortfolioLink)
class PortfolioLinkAdmin(admin.ModelAdmin):
    list_display = ('profile', 'url')
    search_fields = ('profile__user__email', 'url')
