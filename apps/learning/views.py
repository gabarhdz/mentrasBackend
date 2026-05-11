from django.db.models import Prefetch
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from globals.imagekitio import get_upload_authentication
from globals.permissions import IsEmailVerified, IsMentor

from .models import Course, Lesson, Unit
from .serializers import CourseSerializer, LessonSerializer, UnitSerializer


LESSON_PREFETCH = Prefetch(
    "lesson_set",
    queryset=Lesson.objects.order_by("created_at"),
)
UNIT_PREFETCH = Prefetch(
    "unit_set",
    queryset=Unit.objects.prefetch_related(LESSON_PREFETCH).order_by("created_at"),
)


class LearningUploadAuth(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def get(self, request, *args, **kwargs):
        try:
            return Response(get_upload_authentication(), status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MentorCourseListCreate(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def get(self, request, *args, **kwargs):
        courses = (
            Course.objects.filter(author=request.user)
            .prefetch_related(UNIT_PREFETCH)
            .order_by("-created_at")
        )
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            course = serializer.save(author=request.user)
            return Response(
                CourseSerializer(course, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentorCourseDetail(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def get_object(self, request, id):
        try:
            course = (
                Course.objects.select_related("author")
                .prefetch_related(UNIT_PREFETCH)
                .get(id=id)
            )
        except Course.DoesNotExist:
            return None, Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if course.author != request.user:
            return None, Response(
                {"error": "You do not have permission to access this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return course, None

    def get(self, request, id, *args, **kwargs):
        course, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        course, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = CourseSerializer(
            course,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            updated_course = serializer.save()
            return Response(
                CourseSerializer(updated_course, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        course, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MentorUnitListCreate(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def _get_course(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return None, Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if course.author != request.user:
            return None, Response(
                {"error": "You do not have permission to access this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return course, None

    def get(self, request, course_id, *args, **kwargs):
        course, error_response = self._get_course(request, course_id)
        if error_response:
            return error_response

        units = course.unit_set.all().prefetch_related(LESSON_PREFETCH).order_by("created_at")
        serializer = UnitSerializer(units, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, course_id, *args, **kwargs):
        course, error_response = self._get_course(request, course_id)
        if error_response:
            return error_response

        serializer = UnitSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            unit = serializer.save(course=course)
            return Response(
                UnitSerializer(unit, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentorUnitDetail(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def get_object(self, request, id):
        try:
            unit = Unit.objects.select_related("course", "course__author").prefetch_related("lesson_set").get(id=id)
        except Unit.DoesNotExist:
            return None, Response({"error": "Unit not found"}, status=status.HTTP_404_NOT_FOUND)

        if unit.course.author != request.user:
            return None, Response(
                {"error": "You do not have permission to access this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return unit, None

    def get(self, request, id, *args, **kwargs):
        unit, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = UnitSerializer(unit, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        unit, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = UnitSerializer(
            unit,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            updated_unit = serializer.save()
            return Response(
                UnitSerializer(updated_unit, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        unit, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        unit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MentorLessonListCreate(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def _get_unit(self, request, unit_id):
        try:
            unit = Unit.objects.select_related("course", "course__author").prefetch_related(LESSON_PREFETCH).get(id=unit_id)
        except Unit.DoesNotExist:
            return None, Response({"error": "Unit not found"}, status=status.HTTP_404_NOT_FOUND)

        if unit.course.author != request.user:
            return None, Response(
                {"error": "You do not have permission to access this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return unit, None

    def get(self, request, unit_id, *args, **kwargs):
        unit, error_response = self._get_unit(request, unit_id)
        if error_response:
            return error_response

        lessons = unit.lesson_set.all().order_by("created_at")
        serializer = LessonSerializer(lessons, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, unit_id, *args, **kwargs):
        unit, error_response = self._get_unit(request, unit_id)
        if error_response:
            return error_response

        serializer = LessonSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            lesson = serializer.save(unit=unit)
            return Response(
                LessonSerializer(lesson, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentorLessonDetail(APIView):
    permission_classes = [IsAuthenticated, IsEmailVerified, IsMentor]

    def get_object(self, request, id):
        try:
            lesson = Lesson.objects.select_related("unit", "unit__course", "unit__course__author").get(id=id)
        except Lesson.DoesNotExist:
            return None, Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        if lesson.unit.course.author != request.user:
            return None, Response(
                {"error": "You do not have permission to access this lesson."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return lesson, None

    def get(self, request, id, *args, **kwargs):
        lesson, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = LessonSerializer(lesson, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        lesson, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = LessonSerializer(
            lesson,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            updated_lesson = serializer.save()
            return Response(
                LessonSerializer(updated_lesson, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        lesson, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
