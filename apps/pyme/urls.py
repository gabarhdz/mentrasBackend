from django.urls import path

from .views import AccountPymes, PymeDetail


urlpatterns = [
    path("", AccountPymes.as_view(), name="account-pymes"),
    path("<uuid:id>/", PymeDetail.as_view(), name="pyme-detail"),
]
