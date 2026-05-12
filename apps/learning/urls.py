from django.urls import path

from .views import AllCourses


urlpatterns = [
    path("courses/", AllCourses.as_view(), name="all-courses"),
]
