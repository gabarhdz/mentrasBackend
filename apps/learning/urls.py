from django.urls import path

from .views import (
    LearningUploadAuth,
    MentorCourseDetail,
    MentorCourseListCreate,
    MentorLessonDetail,
    MentorLessonListCreate,
    MentorUnitDetail,
    MentorUnitListCreate,
)


urlpatterns = [
    path("uploads/auth/", LearningUploadAuth.as_view(), name="learning-upload-auth"),
    path("courses/", MentorCourseListCreate.as_view(), name="learning-courses"),
    path("courses/<uuid:id>/", MentorCourseDetail.as_view(), name="learning-course-detail"),
    path(
        "courses/<uuid:course_id>/units/",
        MentorUnitListCreate.as_view(),
        name="learning-course-units",
    ),
    path("units/<uuid:id>/", MentorUnitDetail.as_view(), name="learning-unit-detail"),
    path(
        "units/<uuid:unit_id>/lessons/",
        MentorLessonListCreate.as_view(),
        name="learning-unit-lessons",
    ),
    path(
        "lessons/<uuid:id>/",
        MentorLessonDetail.as_view(),
        name="learning-lesson-detail",
    ),
]
