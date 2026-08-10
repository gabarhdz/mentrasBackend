from django.urls import path

from .views import AllForums, DetailedForums, DetailedPost, ForumJoinRequests, JoinForum, AllPost


urlpatterns = [
    path('', AllForums.as_view(), name='all-forums'),
    path('<uuid:id>/', DetailedForums.as_view(), name='detailed-forum'),
    path('<uuid:id>/join/', JoinForum.as_view(), name='join-forum'),
    path('join-requests/', ForumJoinRequests.as_view(), name='forum-join-requests'),
    path('join-requests/<uuid:id>/', ForumJoinRequests.as_view(), name='forum-join-request-detail'),
    path('post/', AllPost.as_view(), name='all-posts'),
    path('post/<uuid:id>/', DetailedPost.as_view(), name='detailed-post'),
]
