from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, MentorApplication
from .serializers import CourseSerializer, MentorApplicationSerializer


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
