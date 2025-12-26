from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Profile, Skill, ProfileSkill, Experience, Project, PortfolioLink, SkillEndorsement

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses here
        user_serializer = UserSerializer(self.user)
        data.update({'user': user_serializer.data})
        data.update({'role': self.user.role}) 
        
        return data

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class ProfileSkillSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='skill.id')
    name = serializers.ReadOnlyField(source='skill.name')
    skill_id = serializers.IntegerField(write_only=True, required=False)
    skill_name = serializers.CharField(write_only=True, required=False)
    endorsements_count = serializers.SerializerMethodField()
    endorsed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = ProfileSkill
        fields = ['id', 'name', 'level', 'endorsements_count', 'endorsed_by_me', 'skill_id', 'skill_name']

    def validate(self, attrs):
        if not attrs.get('skill_id') and not attrs.get('skill_name'):
            raise serializers.ValidationError("Provide either skill_id or skill_name.")
        return attrs

    def get_endorsements_count(self, obj):
        return obj.endorsements.count()

    def get_endorsed_by_me(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.endorsements.filter(endorser=request.user).exists()

class ExperienceSerializer(serializers.ModelSerializer):
    startDate = serializers.DateField(
        source='start_date',
        format='%Y-%m',
        input_formats=['%Y-%m'],
        required=False,
        allow_null=True
    )
    endDate = serializers.DateField(
        source='end_date',
        format='%Y-%m',
        input_formats=['%Y-%m'],
        required=False,
        allow_null=True
    )
    current = serializers.BooleanField(source='is_current', required=False)

    class Meta:
        model = Experience
        fields = ['id', 'title', 'company', 'startDate', 'endDate', 'current', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'image', 'link', 'description']

class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    email = serializers.ReadOnlyField(source='user.email')
    name = serializers.ReadOnlyField(source='user.get_full_name')
    role = serializers.ReadOnlyField(source='user.role')
    
    # Mapped fields
    major = serializers.CharField(source='prodi')
    year = serializers.IntegerField(source='entry_year')
    bio = serializers.CharField(source='about')
    avatar = serializers.SerializerMethodField()
    photo_profile = serializers.ReadOnlyField(source='user.photo_profile')
    
    # Relationships
    skills = ProfileSkillSerializer(source='profile_skills', many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    portfolio = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'name', 'email', 'role',
            'major', 'year', 'bio', 'avatar', 'photo_profile', 'is_active',
            'linkedin', 'github', 'website',
            'skills', 'experiences', 'projects', 'portfolio'
        ]

    def get_avatar(self, obj):
        return getattr(obj.user, 'photo_profile', None)
    
    def get_portfolio(self, obj):
        return [link.url for link in obj.portfolio_links.all()]

class UserSerializer(serializers.ModelSerializer):
    # This serializer is used for Auth response which might need to include profile data inline
    # structure: { token: ..., user: { ...profile_data... } }
    # So we can make UserSerializer basically behave like the main object or nest profile.
    # Frontend expects: user: { id, name, email, major, year, bio, avatar... }
    # So it expects a flattened user+profile object.
    
    profile = ProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'password', 'profile']
    
    name = serializers.CharField(source='first_name')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user)
        return user

    def to_representation(self, instance):
        # Flatten profile into user representation if needed, or just return what we have.
        # Frontend api.ts: currentUser = { id, name, email, major, year, bio, avatar }
        # The current serializer returns { id, email, name, role, profile: { ... } }
        # We might want to flatten it to match 'currentUser' expectation exactly IF the frontend assumes strict flatness.
        # But let's look at api.ts: "user: currentUser". currentUser has flat structure.
        # So we should probably return a flat structure or update frontend to use user.profile.
        # Modifying backend to return flat structure is "following frontend".
        
        ret = super().to_representation(instance)
        profile = ret.pop('profile', None)
        if profile:
            ret.update(profile)
            # Remove redundant fields if any
            if 'user_id' in ret: del ret['user_id']
        return ret
