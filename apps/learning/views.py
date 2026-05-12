from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class AllCourses(APIView):
    def get(self, request, *args, **kwargs):
        courses = Course.objects.select_related("author").prefetch_related("units__lessons").order_by("-created_at")
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
