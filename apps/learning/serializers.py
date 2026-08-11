from rest_framework import serializers

from .models import Course, Lesson, MentorApplication, Unit


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "video", "pdf", "content", "created_at"]


class UnitSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = ["id", "title", "description", "created_at", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    author = serializers.UUIDField(source="author.id", read_only=True)
    units = UnitSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and obj.author_id == request.user.id)

    class Meta:
        model = Course
        fields = ["id", "name", "description", "created_at", "author", "units", "is_owner"]

class MentorApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.UUIDField(source="applicant.id", read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = MentorApplication
        fields = ["id", "applicant", "expertise", "experience", "motivation", "status", "created_at"]
        read_only_fields = ["id", "applicant", "status", "created_at"]
