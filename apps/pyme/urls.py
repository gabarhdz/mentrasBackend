from django.urls import path

from .views import AccountPymes, MyPymes, PymeDetail, CategoryList, PymeEmployees


urlpatterns = [
    path("", AccountPymes.as_view(), name="account-pymes"),
    path("my/", MyPymes.as_view(), name="my-pymes"),
    path("<uuid:id>/", PymeDetail.as_view(), name="pyme-detail"),
    path("categories/", CategoryList.as_view(), name="category-list"),
    path("employees/<uuid:id>/", PymeEmployees.as_view(), name="pyme-employees"),  
]
