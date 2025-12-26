from rest_framework import viewsets, permissions, filters, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, Skill, ProfileSkill, Experience, Project, SkillEndorsement
from .serializers import UserSerializer, ProfileSerializer, SkillSerializer, ProfileSkillSerializer, ExperienceSerializer, ProjectSerializer, CustomTokenObtainPairSerializer
from .utils.supabase_storage import SupabaseUploadError, upload_profile_photo


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Register View
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'prodi', 'about'] # Updated search fields

    def get_queryset(self):
        queryset = Profile.objects.select_related('user')
        queryset = queryset.exclude(user__role='admin')
        return queryset.filter(is_active=True)

    @action(detail=False, methods=['GET', 'PUT'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == 'PUT':
            data = request.data.copy()
            data.pop("file", None)
            data.pop("photo", None)
            data.pop("avatar", None)
            data.pop("photo_profile", None)
            serializer = self.get_serializer(profile, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class SkillViewSet(viewsets.ModelViewSet):
    # Public list of all available skills for autocomplete potentially
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

class ProfileSkillViewSet(viewsets.ModelViewSet):
    # Manage SKILLS OF THE CURRENT USER
    serializer_class = ProfileSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Accept legacy 'name'/'id' payloads by mapping to serializer fields
        data = request.data.copy()
        if 'skill_name' not in data and 'name' in data:
            data['skill_name'] = data.get('name')
        if 'skill_id' not in data and 'id' in data:
            data['skill_id'] = data.get('id')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        return ProfileSkill.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        skill_name = serializer.validated_data.pop('skill_name', None) or self.request.data.get('name')
        skill_id = serializer.validated_data.pop('skill_id', None) or self.request.data.get('id')

        skill = None
        if skill_id:
            try:
                skill = Skill.objects.filter(id=int(skill_id)).first()
            except (TypeError, ValueError):
                skill = None

        if not skill and skill_name:
            skill, _ = Skill.objects.get_or_create(name=skill_name)

        if not skill:
            raise serializers.ValidationError({"name": "Skill name or valid ID required."})

        # Prevent duplicates for the same user
        if ProfileSkill.objects.filter(profile=profile, skill=skill).exists():
            raise serializers.ValidationError({"detail": "You already have this skill."})

        serializer.save(profile=profile, skill=skill)

    def destroy(self, request, *args, **kwargs):
        # Allow deletion by skill id in the URL (matches serializer id) for current user
        skill_id = kwargs.get("pk")
        profile = Profile.objects.filter(user=request.user).first()
        if not profile:
            return Response(status=status.HTTP_404_NOT_FOUND)

        profile_skill = ProfileSkill.objects.filter(profile=profile, skill__id=skill_id).first()
        if not profile_skill:
            return Response(status=status.HTTP_404_NOT_FOUND)

        profile_skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class AdminStudentsView(APIView):
    """Admin API for managing all student profiles"""
    permission_classes = [IsAdmin]

    def get(self, request):
        """Get all student profiles with their status"""
        profiles = Profile.objects.exclude(user__role='admin').select_related('user')
        serializer = ProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class AdminStudentDetailView(APIView):
    """Admin API for managing individual student profile"""
    permission_classes = [IsAdmin]

    def get_profile(self, user_id):
        """Helper to get profile by user_id"""
        try:
            return Profile.objects.select_related('user').get(user__id=user_id, user__role='mahasiswa')
        except Profile.DoesNotExist:
            return None

    def get(self, request, user_id):
        """Get single student profile"""
        profile = self.get_profile(user_id)
        if not profile:
            return Response(
                {'detail': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, user_id):
        """Update student profile status (activate/deactivate)"""
        profile = self.get_profile(user_id)
        if not profile:
            return Response(
                {'detail': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle is_active flag for profile
        if 'is_active' in request.data:
            profile.is_active = request.data['is_active']
            profile.save()
        
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)


class ProfilePhotoUploadView(APIView):
    """Upload a profile photo to Supabase Storage and persist the public URL."""

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        photo_file = request.FILES.get("file") or request.FILES.get("photo")
        if not photo_file:
            return Response(
                {"detail": "No file provided. Attach the photo with the key 'file' or 'photo'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            public_url = upload_profile_photo(photo_file)
        except SupabaseUploadError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        request.user.photo_profile = public_url
        request.user.save(update_fields=["photo_profile"])

        return Response({"photo_profile": public_url}, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)


class SkillEndorsementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_profile_skill(self, profile_id, skill_id):
        return ProfileSkill.objects.select_related("profile__user", "skill").filter(
            profile_id=profile_id,
            skill_id=skill_id,
        ).first()

    def post(self, request, *args, **kwargs):
        profile_id = request.data.get("profile_id")
        skill_id = request.data.get("skill_id")
        if not profile_id or not skill_id:
            return Response(
                {"detail": "profile_id and skill_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile_skill = self._get_profile_skill(profile_id, skill_id)
        if not profile_skill:
            return Response({"detail": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)

        if profile_skill.profile.user_id == request.user.id:
            return Response(
                {"detail": "You cannot endorse your own skill."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        SkillEndorsement.objects.get_or_create(
            profile_skill=profile_skill,
            endorser=request.user,
        )

        return Response(
            {
                "endorsements_count": profile_skill.endorsements.count(),
                "endorsed_by_me": True,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        profile_id = request.data.get("profile_id") or request.query_params.get("profile_id")
        skill_id = request.data.get("skill_id") or request.query_params.get("skill_id")
        if not profile_id or not skill_id:
            return Response(
                {"detail": "profile_id and skill_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile_skill = self._get_profile_skill(profile_id, skill_id)
        if not profile_skill:
            return Response({"detail": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)

        SkillEndorsement.objects.filter(
            profile_skill=profile_skill,
            endorser=request.user,
        ).delete()

        return Response(
            {
                "endorsements_count": profile_skill.endorsements.count(),
                "endorsed_by_me": False,
            },
            status=status.HTTP_200_OK,
        )
