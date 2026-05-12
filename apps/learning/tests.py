from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course, Lesson, Unit


class LearningRoutesTests(APITestCase):
    def test_courses_endpoint_returns_courses_from_database(self):
        author = get_user_model().objects.create_user(
            username="courseauthor",
            email="courseauthor@example.com",
            password="StrongPass123",
            is_email_verified=True,
        )
        course = Course.objects.create(
            name="Curso de inventario",
            description="Aprende control de stock",
            author=author,
        )
        unit = Unit.objects.create(
            title="Unidad 1",
            description="Fundamentos",
            course=course,
        )
        Lesson.objects.create(
            title="Leccion inicial",
            video="https://example.com/video.mp4",
            pdf="https://example.com/guide.pdf",
            content="Contenido base",
            unit=unit,
        )

        response = self.client.get(reverse("all-courses"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Curso de inventario")
        self.assertEqual(response.data[0]["author"], str(author.id))
        self.assertEqual(response.data[0]["units"][0]["title"], "Unidad 1")
        self.assertEqual(response.data[0]["units"][0]["lessons"][0]["title"], "Leccion inicial")
