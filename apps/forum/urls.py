from django.urls import path

from .views import AllForums, DetailedForums, DetailedPost


urlpatterns = [
    path('', AllForums.as_view(), name='all-forums'),
    path('<int:id>/', DetailedForums.as_view(), name='detailed-forum'),
    path('post/<int:id>/', DetailedPost.as_view(), name='detailed-post'),
]
