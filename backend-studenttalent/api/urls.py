from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ProfileViewSet,
    SkillViewSet,
    ProfileSkillViewSet,
    ExperienceViewSet,
    CustomTokenObtainPairView,
    RegisterView,
    AdminStudentsView,
    AdminStudentDetailView,
    ProfilePhotoUploadView,
    SkillEndorsementView,
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet) # Public Talents accessible here
router.register(r'skills', ProfileSkillViewSet, basename='user-skill') # User's skills
router.register(r'all-skills', SkillViewSet) # List of all skills
router.register(r'experiences', ExperienceViewSet)

urlpatterns = [
    path('skills/endorse/', SkillEndorsementView.as_view(), name='skill-endorse'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    # Admin endpoints
    path('admin/students/', AdminStudentsView.as_view(), name='admin-students'),
    path('admin/students/<int:user_id>/', AdminStudentDetailView.as_view(), name='admin-student-detail'),
    path('users/me/photo/', ProfilePhotoUploadView.as_view(), name='user-photo-upload'),
    path('profiles/upload-photo/', ProfilePhotoUploadView.as_view(), name='profile-photo-upload'),
    path('', include(router.urls)),
]
