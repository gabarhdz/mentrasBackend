from uuid import uuid4

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course, Lesson, MentorApplication, Unit


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

    def test_course_detail_returns_full_course_content(self):
        author = get_user_model().objects.create_user(
            username="detailauthor",
            email="detailauthor@example.com",
            password="StrongPass123",
            is_email_verified=True,
        )
        course = Course.objects.create(
            name="Curso completo",
            description="Todo el contenido del curso",
            author=author,
        )
        unit = Unit.objects.create(
            title="Unidad detallada",
            description="Descripcion de unidad",
            course=course,
        )
        lesson = Lesson.objects.create(
            title="Leccion detallada",
            video="https://example.com/detail-video.mp4",
            pdf="https://example.com/detail-guide.pdf",
            content="Contenido detallado",
            unit=unit,
        )

        response = self.client.get(reverse("course-detail", args=[course.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(course.id))
        self.assertEqual(response.data["name"], "Curso completo")
        self.assertEqual(response.data["description"], "Todo el contenido del curso")
        self.assertEqual(response.data["author"], str(author.id))
        self.assertEqual(len(response.data["units"]), 1)
        self.assertEqual(response.data["units"][0]["title"], "Unidad detallada")
        self.assertEqual(len(response.data["units"][0]["lessons"]), 1)
        self.assertEqual(response.data["units"][0]["lessons"][0]["id"], str(lesson.id))
        self.assertEqual(response.data["units"][0]["lessons"][0]["title"], "Leccion detallada")
        self.assertEqual(response.data["units"][0]["lessons"][0]["content"], "Contenido detallado")

    def test_course_detail_returns_404_for_missing_course(self):
        response = self.client.get(reverse("course-detail", args=[uuid4()]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MentorApplicationAdminTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            username="platformadmin",
            email="platformadmin@example.com",
            password="StrongPass123",
            is_admin=True,
            is_email_verified=True,
        )
        self.applicant = user_model.objects.create_user(
            username="mentorapplicant",
            email="mentorapplicant@example.com",
            password="StrongPass123",
            is_email_verified=True,
        )
        self.application = MentorApplication.objects.create(
            applicant=self.applicant,
            expertise="Finanzas",
            experience="Cinco años asesorando pequeñas empresas.",
            motivation="Quiero compartir herramientas prácticas.",
        )

    def test_admin_can_review_and_approve_a_pending_application(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("mentor-applications-admin"), {"status": "pending"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["applicant_username"], self.applicant.username)
        self.assertEqual(response.data[0]["applicant_email"], self.applicant.email)

        response = self.client.patch(
            reverse("mentor-application-decision", args=[self.application.id]),
            {"status": MentorApplication.APPROVED},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], MentorApplication.APPROVED)
        self.application.refresh_from_db()
        self.applicant.refresh_from_db()
        self.assertEqual(self.application.status, MentorApplication.APPROVED)
        self.assertTrue(self.applicant.is_mentor)

    def test_superuser_can_access_mentor_application_management(self):
        superuser = get_user_model().objects.create_superuser(
            username="gabarhdz",
            email="gabarhdz@example.com",
            password="StrongPass123",
            is_email_verified=True,
        )
        self.client.force_authenticate(superuser)

        response = self.client.get(reverse("mentor-applications-admin"), {"status": "pending"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["applicant_username"], self.applicant.username)

    def test_admin_can_list_and_remove_mentor_role(self):
        mentor = get_user_model().objects.create_user(
            username="currentmentor",
            email="currentmentor@example.com",
            password="StrongPass123",
            is_mentor=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("mentor-users-admin"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["username"], mentor.username)

        response = self.client.delete(reverse("mentor-role-admin", args=[mentor.id, "mentor"]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_mentor"])
        mentor.refresh_from_db()
        self.assertFalse(mentor.is_mentor)

    def test_admin_can_list_and_remove_pyme_owner_role(self):
        pyme_owner = get_user_model().objects.create_user(
            username="currentpymeowner",
            email="currentpymeowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("mentor-users-admin"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["username"], pyme_owner.username)

        response = self.client.delete(reverse("mentor-role-admin", args=[pyme_owner.id, "pyme_owner"]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_pyme_owner"])
        pyme_owner.refresh_from_db()
        self.assertFalse(pyme_owner.is_pyme_owner)

    def test_admin_cannot_remove_superuser_mentor_role_from_learning_admin(self):
        superuser = get_user_model().objects.create_superuser(
            username="supermentor",
            email="supermentor@example.com",
            password="StrongPass123",
            is_mentor=True,
            is_email_verified=True,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.delete(reverse("mentor-role-admin", args=[superuser.id, "mentor"]))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        superuser.refresh_from_db()
        self.assertTrue(superuser.is_mentor)

    def test_non_admin_cannot_access_mentor_application_management(self):
        self.client.force_authenticate(self.applicant)

        response = self.client.get(reverse("mentor-applications-admin"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
