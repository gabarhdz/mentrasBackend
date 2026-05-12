from uuid import uuid4

from django.conf import settings
from django.db import models
from django.utils import timezone


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Unit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="units")

    def __str__(self):
        return self.title


class Lesson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=255)
    video = models.CharField(max_length=500, blank=True)
    pdf = models.CharField(max_length=500, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="lessons")

    def __str__(self):
        return self.title


class UserCourse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    enrolled_at = models.DateTimeField(default=timezone.now)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_courses")


class UserLessonProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(default=timezone.now)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_entries")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_lesson_progress",
    )
