from django.contrib import admin
from .models import Course, Lesson, Unit, UserCourse, UserLessonProgress

admin.site.register(Course)
admin.site.register(Unit)
admin.site.register(Lesson)
admin.site.register(UserCourse)
admin.site.register(UserLessonProgress)
