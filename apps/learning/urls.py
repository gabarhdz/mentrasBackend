from django.urls import path

from .views import (
    AllCourses,
    CourseDetail,
    MentorApplicationDecisionView,
    MentorApplicationView,
    MentorApplicationsAdminView,
    MentorRoleAdminView,
    MentorsAdminView,
)


urlpatterns = [
    path("courses/", AllCourses.as_view(), name="all-courses"),
    path("courses/<uuid:id>/", CourseDetail.as_view(), name="course-detail"),
    path("mentor/apply/", MentorApplicationView.as_view(), name="mentor-application"),
    path("mentor/applications/", MentorApplicationsAdminView.as_view(), name="mentor-applications-admin"),
    path("mentor/users/", MentorsAdminView.as_view(), name="mentor-users-admin"),
    path("mentor/users/<uuid:id>/<str:role>/", MentorRoleAdminView.as_view(), name="mentor-role-admin"),
    path(
        "mentor/applications/<int:id>/",
        MentorApplicationDecisionView.as_view(),
        name="mentor-application-decision",
    ),
]
