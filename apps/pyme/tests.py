from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from .models import Category, Pyme
from .serializers import PymeSerializer


def build_test_image(name="pyme.gif"):
    return SimpleUploadedFile(
        name,
        (
            b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
            b"\x00\x00\x00\xff\xff\xff!\xf9\x04"
            b"\x01\x00\x00\x00\x00,\x00\x00\x00"
            b"\x00\x01\x00\x01\x00\x00\x02\x02D"
            b"\x01\x00;"
        ),
        content_type="image/gif",
    )


class PymeSerializerTests(APITestCase):
    @patch("globals.cloudinary.cloudinary.uploader.upload")
    def test_serializer_uploads_profile_pic_to_cloudinary(self, mock_upload):
        mock_upload.return_value = {"secure_url": "https://cloudinary.example.com/pyme.gif"}
        owner = get_user_model().objects.create_user(
            username="pymeowner",
            email="owner@example.com",
            password="StrongPass123",
        )
        category = Category.objects.create(name="Food")
        payload = {
            "name": "Cafe Mentras",
            "description": "Cafe de especialidad",
            "category_id": category.id,
            "foundation_date": "2024-01-15",
            "profile_pic": build_test_image(),
        }

        serializer = PymeSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        pyme = serializer.save(owner=owner)
        self.assertEqual(pyme.profile_pic, "https://cloudinary.example.com/pyme.gif")
        mock_upload.assert_called_once()


class PymeViewsTests(APITestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            username="verifiedowner",
            email="verifiedowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.other_user = get_user_model().objects.create_user(
            username="someoneelse",
            email="other@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.category = Category.objects.create(name="Retail")
        self.pyme = Pyme.objects.create(
            name="Mentras Shop",
            description="Tienda principal",
            owner=self.owner,
            category=self.category,
            profile_pic="https://example.com/existing.png",
            foundation_date="2022-06-10",
        )

    def test_get_only_returns_authenticated_user_pymes(self):
        Pyme.objects.create(
            name="Other Shop",
            description="Otra tienda",
            owner=self.other_user,
            category=self.category,
            foundation_date="2021-03-20",
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(reverse("account-pymes"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], str(self.pyme.id))

    def test_get_specific_pyme_blocks_non_owner(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(reverse("pyme-detail", args=[self.pyme.id]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("globals.cloudinary.cloudinary.uploader.upload")
    def test_post_creates_pyme_for_verified_owner(self, mock_upload):
        mock_upload.return_value = {"secure_url": "https://cloudinary.example.com/new-pyme.gif"}
        self.client.force_authenticate(user=self.owner)
        payload = {
            "name": "Nueva Pyme",
            "description": "Descripcion nueva",
            "category_id": str(self.category.id),
            "foundation_date": "2024-07-18",
            "profile_pic": build_test_image("new-pyme.gif"),
        }

        response = self.client.post(reverse("account-pymes"), payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_pyme = Pyme.objects.get(name="Nueva Pyme")
        self.assertEqual(created_pyme.owner, self.owner)
        self.assertEqual(response.data["profile_pic"], "https://cloudinary.example.com/new-pyme.gif")

    def test_patch_updates_pyme_partially(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse("pyme-detail", args=[self.pyme.id]),
            {"description": "Descripcion actualizada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pyme.refresh_from_db()
        self.assertEqual(self.pyme.description, "Descripcion actualizada")
        self.assertEqual(self.pyme.name, "Mentras Shop")
