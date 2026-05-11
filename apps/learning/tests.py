from unittest.mock import patch
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import TemporaryUploadedFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from globals.imagekitio import upload_video

from .models import Course, Lesson, Unit
from .serializers import LessonSerializer


def build_test_video(name="lesson.mp4"):
    return SimpleUploadedFile(
        name,
        b"\x00\x00\x00\x18ftypmp42" + (b"\x00" * 128),
        content_type="video/mp4",
    )


class LearningLessonUploadTests(APITestCase):
    def setUp(self):
        self.mentor = get_user_model().objects.create_user(
            username="mentoruser",
            email="mentor@example.com",
            password="StrongPass123",
            is_mentor=True,
            is_email_verified=True,
        )
        self.course = Course.objects.create(
            name="Curso de prueba",
            description="Descripcion",
            author=self.mentor,
        )
        self.unit = Unit.objects.create(
            course=self.course,
            title="Unidad 1",
            description="Intro",
        )

    @override_settings(FILE_UPLOAD_MAX_MEMORY_SIZE=1)
    @patch("apps.learning.serializers.upload_video")
    def test_post_lesson_accepts_temporary_uploaded_video_files(self, mock_upload_video):
        mock_upload_video.return_value = "https://media.example.com/lesson.mp4"
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            reverse("learning-unit-lessons", args=[self.unit.id]),
            {
                "title": "Leccion 1",
                "content": "Contenido",
                "video_file": build_test_video(),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_lesson = Lesson.objects.get(title="Leccion 1")
        self.assertEqual(created_lesson.unit, self.unit)
        self.assertEqual(created_lesson.video, "https://media.example.com/lesson.mp4")
        mock_upload_video.assert_called_once()

    @patch("apps.learning.serializers.upload_video")
    def test_post_lesson_accepts_video_file_sent_as_video_alias(self, mock_upload_video):
        mock_upload_video.return_value = "https://media.example.com/lesson-alias.mp4"
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            reverse("learning-unit-lessons", args=[self.unit.id]),
            {
                "title": "Leccion alias",
                "content": "Contenido",
                "video": build_test_video("alias.mp4"),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_lesson = Lesson.objects.get(title="Leccion alias")
        self.assertEqual(created_lesson.video, "https://media.example.com/lesson-alias.mp4")
        mock_upload_video.assert_called_once()

    def test_post_lesson_accepts_direct_video_url(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            reverse("learning-unit-lessons", args=[self.unit.id]),
            {
                "title": "Leccion directa",
                "content": "Contenido",
                "video_url": "https://ik.imagekit.io/demo/lesson.mp4",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_lesson = Lesson.objects.get(title="Leccion directa")
        self.assertEqual(created_lesson.video, "https://ik.imagekit.io/demo/lesson.mp4")

    def test_serializer_rejects_video_file_and_video_url_together(self):
        serializer = LessonSerializer(
            data={
                "title": "Leccion invalida",
                "content": "Contenido",
                "video_file": build_test_video(),
                "video_url": "https://ik.imagekit.io/demo/lesson.mp4",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("video_file", serializer.errors)

    @patch("apps.learning.views.get_upload_authentication")
    def test_upload_auth_endpoint_returns_signed_parameters(self, mock_get_upload_authentication):
        mock_get_upload_authentication.return_value = {
            "token": "upload-token",
            "expire": 9999999999,
            "signature": "signed",
            "publicKey": "public_test_key",
            "urlEndpoint": "https://ik.imagekit.io/demo",
        }
        self.client.force_authenticate(user=self.mentor)

        response = self.client.get(reverse("learning-upload-auth"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["token"], "upload-token")
        self.assertEqual(response.data["publicKey"], "public_test_key")


class ImageKitUploadHelperTests(APITestCase):
    @patch("globals.imagekitio.imagekit.files.upload")
    def test_upload_video_uses_temporary_path_and_removes_it_after_success(self, mock_upload):
        file = build_test_video("cleanup.mp4")
        captured = {}

        def fake_upload(**kwargs):
            temp_path = kwargs["file"]
            captured["path"] = temp_path
            captured["name"] = kwargs["file_name"]
            self.assertTrue(temp_path.exists())
            file.seek(0)
            self.assertEqual(temp_path.read_bytes(), file.read())
            return {"url": "https://media.example.com/cleanup.mp4"}

        mock_upload.side_effect = fake_upload

        uploaded_url = upload_video(
            file,
            folder="learning/lessons/videos",
            public_id="lesson-cleanup-video",
        )

        self.assertEqual(uploaded_url, "https://media.example.com/cleanup.mp4")
        self.assertEqual(captured["name"], "lesson-cleanup-video.mp4")
        self.assertFalse(captured["path"].exists())

    @patch("globals.imagekitio.imagekit.files.upload")
    def test_upload_video_removes_temporary_path_after_failure(self, mock_upload):
        file = build_test_video("failure.mp4")
        captured = {}

        def fake_upload(**kwargs):
            temp_path = kwargs["file"]
            captured["path"] = temp_path
            self.assertTrue(temp_path.exists())
            raise RuntimeError("upload failed")

        mock_upload.side_effect = fake_upload

        with self.assertRaises(RuntimeError):
            upload_video(
                file,
                folder="learning/lessons/videos",
                public_id="lesson-failure-video",
            )

        self.assertFalse(captured["path"].exists())

    @patch("globals.imagekitio.imagekit.files.upload")
    def test_upload_video_reuses_django_temporary_uploaded_file_path(self, mock_upload):
        file = TemporaryUploadedFile(
            name="existing-temp.mp4",
            content_type="video/mp4",
            size=0,
            charset=None,
        )
        file.write(b"\x00\x00\x00\x18ftypmp42" + (b"\x00" * 128))
        file.seek(0)
        original_path = file.temporary_file_path()
        captured = {}

        def fake_upload(**kwargs):
            captured["path"] = kwargs["file"]
            captured["timeout"] = kwargs["timeout"]
            self.assertEqual(str(kwargs["file"]), original_path)
            self.assertTrue(kwargs["file"].exists())
            return {"url": "https://media.example.com/existing-temp.mp4"}

        mock_upload.side_effect = fake_upload

        try:
            uploaded_url = upload_video(
                file,
                folder="learning/lessons/videos",
                public_id="lesson-existing-temp-video",
            )
        finally:
            file.close()

        self.assertEqual(uploaded_url, "https://media.example.com/existing-temp.mp4")
        self.assertEqual(captured["path"], Path(original_path))
