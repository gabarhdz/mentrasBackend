from django.urls import path

from .views import AccountPymes, CategoryList, MyPymes, PymeDetail, PymeEmployees


urlpatterns = [
    path("", AccountPymes.as_view(), name="account-pymes"),
    path("my/", MyPymes.as_view(), name="my-pymes"),
    path("categories/", CategoryList.as_view(), name="pyme-categories"),
    path("<uuid:pyme_id>/employees/", PymeEmployees.as_view(), name="pyme-employees"),
    path("<uuid:id>/", PymeDetail.as_view(), name="pyme-detail"),
]
