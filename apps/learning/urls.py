from django.urls import path

from .views import AllCourses, CourseDetail, MentorApplicationView


urlpatterns = [
    path("courses/", AllCourses.as_view(), name="all-courses"),
    path("courses/<uuid:id>/", CourseDetail.as_view(), name="course-detail"),
    path("mentor/apply/", MentorApplicationView.as_view(), name="mentor-application"),
]
