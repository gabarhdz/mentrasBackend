from rest_framework import serializers

from .models import Course, Lesson, Unit


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

    class Meta:
        model = Course
        fields = ["id", "name", "description", "created_at", "author", "units"]

