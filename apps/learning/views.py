from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.notifications.services import create_notification

from .models import Course, MentorApplication
from .serializers import (
    CourseSerializer,
    MentorApplicationAdminSerializer,
    MentorApplicationSerializer,
    MentorUserSerializer,
)
from apps.user.models import User


class AllCourses(APIView):
    def get(self, request, *args, **kwargs):
        courses = (
            Course.objects.select_related("author")
            .prefetch_related("units__lessons")
            .order_by("-created_at")
        )
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)


class CourseDetail(APIView):
    def get(self, request, id, *args, **kwargs):
        try:
            course = (
                Course.objects.select_related("author")
                .prefetch_related("units__lessons")
                .get(id=id)
            )
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        try:
            course = Course.objects.get(id=id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if course.author != request.user:
            return Response({"error": "You do not have permission to edit this course"}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseSerializer(course, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course, context={"request": request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            course = Course.objects.get(id=id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if course.author != request.user:
            return Response({"error": "You do not have permission to delete this course"}, status=status.HTTP_403_FORBIDDEN)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MentorApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.is_mentor:
            return Response({"error": "You are already a mentor"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MentorApplicationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if MentorApplication.objects.filter(applicant=request.user, status=MentorApplication.PENDING).exists():
            return Response({"error": "You already have a pending mentor application"}, status=status.HTTP_400_BAD_REQUEST)

        application = serializer.save(applicant=request.user)
        for admin in request.user.__class__.objects.filter(is_admin=True):
            create_notification(
                admin,
                "Nueva solicitud de mentor",
                f"{request.user.username} ha enviado una solicitud para ser mentor.",
                "mentor_application",
            )
        try:
            send_mail(
                subject=f"Nueva solicitud de mentor: {request.user.username}",
                message=(
                    f"Usuario: {request.user.username}\n"
                    f"Email: {request.user.email}\n"
                    f"Especialidad: {application.expertise}\n\n"
                    f"Experiencia:\n{application.experience}\n\n"
                    f"Motivación:\n{application.motivation}"
                ),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=["mentras.app@gmail.com"],
                fail_silently=False,
            )
        except Exception:
            application.delete()
            return Response(
                {"error": "The mentor application email could not be sent"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(MentorApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class MentorApplicationsAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def _has_admin_access(self, request):
        return bool(
            getattr(request.user, "is_admin", False)
            or getattr(request.user, "is_superuser", False)
        )

    def get(self, request, *args, **kwargs):
        if not self._has_admin_access(request):
            return Response(
                {"error": "You do not have permission to manage mentor applications"},
                status=status.HTTP_403_FORBIDDEN,
            )

        applications = MentorApplication.objects.select_related("applicant").all()
        status_filter = request.query_params.get("status")

        if status_filter:
            valid_statuses = {choice[0] for choice in MentorApplication.STATUS_CHOICES}
            if status_filter not in valid_statuses:
                return Response(
                    {"error": "Invalid mentor application status"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            applications = applications.filter(status=status_filter)

        return Response(MentorApplicationAdminSerializer(applications, many=True).data)


class MentorApplicationDecisionView(MentorApplicationsAdminView):
    def patch(self, request, id, *args, **kwargs):
        if not self._has_admin_access(request):
            return Response(
                {"error": "You do not have permission to manage mentor applications"},
                status=status.HTTP_403_FORBIDDEN,
            )

        decision = request.data.get("status")
        valid_decisions = {MentorApplication.APPROVED, MentorApplication.REJECTED}

        if decision not in valid_decisions:
            return Response(
                {"error": "Status must be approved or rejected"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application = MentorApplication.objects.select_related("applicant").get(id=id)
        except MentorApplication.DoesNotExist:
            return Response({"error": "Mentor application not found"}, status=status.HTTP_404_NOT_FOUND)

        if application.status != MentorApplication.PENDING:
            return Response(
                {"error": "This mentor application has already been reviewed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            application.status = decision
            application.save(update_fields=["status"])

            if decision == MentorApplication.APPROVED and not application.applicant.is_mentor:
                application.applicant.is_mentor = True
                application.applicant.save(update_fields=["is_mentor"])

        return Response(MentorApplicationAdminSerializer(application).data, status=status.HTTP_200_OK)


class MentorsAdminView(MentorApplicationsAdminView):
    def get(self, request, *args, **kwargs):
        if not self._has_admin_access(request):
            return Response(
                {"error": "You do not have permission to manage user roles"},
                status=status.HTTP_403_FORBIDDEN,
            )

        users = User.objects.filter(is_mentor=True) | User.objects.filter(is_pyme_owner=True)
        users = users.distinct().order_by("username")
        return Response(MentorUserSerializer(users, many=True).data, status=status.HTTP_200_OK)


class MentorRoleAdminView(MentorApplicationsAdminView):
    ALLOWED_ROLES = {
        "mentor": "is_mentor",
        "pyme_owner": "is_pyme_owner",
    }

    def delete(self, request, id, role, *args, **kwargs):
        if not self._has_admin_access(request):
            return Response(
                {"error": "You do not have permission to manage user roles"},
                status=status.HTTP_403_FORBIDDEN,
            )

        field_name = self.ALLOWED_ROLES.get(role)
        if not field_name:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not getattr(user, field_name):
            return Response({"error": "This user does not have that role"}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_admin or user.is_superuser:
            return Response(
                {"error": "Admin and superuser roles must be changed from the user administration backend"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        setattr(user, field_name, False)
        user.save(update_fields=[field_name])
        return Response(MentorUserSerializer(user).data, status=status.HTTP_200_OK)
