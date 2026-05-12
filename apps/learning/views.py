from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class AllCourses(APIView):
    def get(self, request, *args, **kwargs):
        courses = (
            Course.objects.select_related("author")
            .prefetch_related("units__lessons")
            .order_by("-created_at")
        )
        serializer = CourseSerializer(courses, many=True)
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

        serializer = CourseSerializer(course)
        return Response(serializer.data, status=status.HTTP_200_OK)

