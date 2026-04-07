from django.urls import path

from .views import AllForums, DetailedForums, DetailedPost,AllPost


urlpatterns = [
    path('', AllForums.as_view(), name='all-forums'),
    path('<uuid:id>/', DetailedForums.as_view(), name='detailed-forum'),
    path('post/', AllPost.as_view(), name='all-posts'),
    path('post/<uuid:id>/', DetailedPost.as_view(), name='detailed-post'),
]
