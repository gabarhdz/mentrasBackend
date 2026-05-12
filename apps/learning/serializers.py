from pathlib import Path

from rest_framework import serializers

from globals.imagekitio import upload_document, upload_video

from .models import Course, Lesson, Unit


ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}


class LessonSummarySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "title", "video", "pdf", "created_at"]
        read_only_fields = fields


class UnitSummarySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    lessons = LessonSummarySerializer(many=True, read_only=True, source="lesson_set")

    class Meta:
        model = Unit
        fields = ["id", "title", "description", "created_at", "lessons"]
        read_only_fields = fields


class CourseSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    author = serializers.UUIDField(source="author.id", read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    units = UnitSummarySerializer(many=True, read_only=True, source="unit_set")

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "description",
            "author",
            "author_username",
            "created_at",
            "units",
        ]
        read_only_fields = ["id", "author", "author_username", "created_at", "units"]


class UnitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    course = serializers.UUIDField(source="course.id", read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source="course",
        write_only=True,
        required=False,
    )
    lessons = LessonSummarySerializer(many=True, read_only=True, source="lesson_set")

    class Meta:
        model = Unit
        fields = [
            "id",
            "course",
            "course_id",
            "title",
            "description",
            "created_at",
            "lessons",
        ]
        read_only_fields = ["id", "course", "created_at", "lessons"]


class LessonSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    unit = serializers.UUIDField(source="unit.id", read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(),
        source="unit",
        write_only=True,
        required=False,
    )
    video_file = serializers.FileField(required=False, write_only=True, allow_null=True)
    pdf_file = serializers.FileField(required=False, write_only=True, allow_null=True)
    video_url = serializers.URLField(required=False, write_only=True, allow_null=True)
    pdf_url = serializers.URLField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "unit",
            "unit_id",
            "title",
            "content",
            "video",
            "pdf",
            "video_file",
            "pdf_file",
            "video_url",
            "pdf_url",
            "created_at",
        ]
        read_only_fields = ["id", "unit", "video", "pdf", "created_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)

        # Some clients send uploaded files using the model field names (`video`, `pdf`)
        # instead of the write-only upload fields (`video_file`, `pdf_file`).
        video_alias = self.initial_data.get("video")
        pdf_alias = self.initial_data.get("pdf")

        if "video_file" not in attrs and hasattr(video_alias, "read"):
            attrs["video_file"] = video_alias
        elif "video_url" not in attrs and isinstance(video_alias, str) and video_alias.strip():
            attrs["video_url"] = video_alias.strip()

        if "pdf_file" not in attrs and hasattr(pdf_alias, "read"):
            attrs["pdf_file"] = pdf_alias
        elif "pdf_url" not in attrs and isinstance(pdf_alias, str) and pdf_alias.strip():
            attrs["pdf_url"] = pdf_alias.strip()

        if attrs.get("video_file") and attrs.get("video_url"):
            raise serializers.ValidationError({"video_file": "Send either video_file or video_url, not both."})

        if attrs.get("pdf_file") and attrs.get("pdf_url"):
            raise serializers.ValidationError({"pdf_file": "Send either pdf_file or pdf_url, not both."})

        return attrs

    def _validate_extension(self, uploaded_file, allowed_extensions, field_name):
        suffix = Path(uploaded_file.name).suffix.lower()
        if suffix not in allowed_extensions:
            raise serializers.ValidationError(
                {field_name: f"Unsupported file type. Allowed types: {', '.join(sorted(allowed_extensions))}."}
            )

    def _upload_lesson_media(
        self,
        instance,
        video_file=None,
        pdf_file=None,
        video_url=None,
        pdf_url=None,
        *,
        overwrite=False,
    ):
        updates = []

        if video_url:
            instance.video = video_url
            updates.append("video")
        elif video_file:
            self._validate_extension(video_file, ALLOWED_VIDEO_EXTENSIONS, "video_file")
            video_url = upload_video(
                video_file,
                folder="learning/lessons/videos",
                public_id=f"lesson-{instance.id}-video",
                overwrite=overwrite,
            )
            if not video_url:
                raise serializers.ValidationError({"video_file": "Video upload failed."})
            instance.video = video_url
            updates.append("video")

        if pdf_url:
            instance.pdf = pdf_url
            updates.append("pdf")
        elif pdf_file:
            self._validate_extension(pdf_file, ALLOWED_PDF_EXTENSIONS, "pdf_file")
            pdf_url = upload_document(
                pdf_file,
                folder="learning/lessons/pdfs",
                public_id=f"lesson-{instance.id}-pdf",
                overwrite=overwrite,
            )
            if not pdf_url:
                raise serializers.ValidationError({"pdf_file": "PDF upload failed."})
            instance.pdf = pdf_url
            updates.append("pdf")

        if updates:
            instance.save(update_fields=updates)

        return instance

    def create(self, validated_data):
        video_file = validated_data.pop("video_file", None)
        pdf_file = validated_data.pop("pdf_file", None)
        video_url = validated_data.pop("video_url", None)
        pdf_url = validated_data.pop("pdf_url", None)
        lesson = Lesson.objects.create(**validated_data)
        return self._upload_lesson_media(
            lesson,
            video_file,
            pdf_file,
            video_url,
            pdf_url,
            overwrite=False,
        )

    def update(self, instance, validated_data):
        video_file = validated_data.pop("video_file", None)
        pdf_file = validated_data.pop("pdf_file", None)
        video_url = validated_data.pop("video_url", None)
        pdf_url = validated_data.pop("pdf_url", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return self._upload_lesson_media(
            instance,
            video_file,
            pdf_file,
            video_url,
            pdf_url,
            overwrite=True,
        )
