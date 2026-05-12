from django.urls import path

from .views import AllCourses, CourseDetail


urlpatterns = [
    path("courses/", AllCourses.as_view(), name="all-courses"),
    path("courses/<uuid:id>/", CourseDetail.as_view(), name="course-detail"),
]
