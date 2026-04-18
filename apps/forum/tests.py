from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from .models import Forum, ForumUser


def build_test_image(name="forum.gif"):
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


class AllViewTests(APITestCase):
    def test_get_returns_all_forums(self):
        older_forum = Forum.objects.create(
            name='Older Forum',
            description='First forum',
            profile_pic='older.png',
            is_private=False,
        )
        newer_forum = Forum.objects.create(
            name='Newer Forum',
            description='Second forum',
            profile_pic='newer.png',
            is_private=True,
        )

        response = self.client.get(reverse('all-forums'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['id'], str(newer_forum.id))
        self.assertEqual(response.data[1]['id'], str(older_forum.id))

    @patch("globals.cloudinary.cloudinary.uploader.upload")
    def test_post_creates_forum(self, mock_upload):
        mock_upload.return_value = {"secure_url": "https://cloudinary.example.com/forum.gif"}
        payload = {
            'name': 'Backend Forum',
            'description': 'A place to discuss backend topics',
            'profile_pic': build_test_image(),
            'is_private': False,
        }

        response = self.client.post(reverse('all-forums'), payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Forum.objects.count(), 1)
        forum = Forum.objects.get(name='Backend Forum')
        self.assertEqual(response.data['id'], str(forum.id))
        self.assertEqual(response.data['description'], payload['description'])
        self.assertEqual(response.data['profile_pic'], "https://cloudinary.example.com/forum.gif")

    @patch("globals.cloudinary.cloudinary.uploader.upload")
    def test_post_creates_admin_forum_user_for_authenticated_creator(self, mock_upload):
        mock_upload.return_value = {"secure_url": "https://cloudinary.example.com/admin-forum.gif"}
        user = get_user_model().objects.create_user(
            username='forumcreator',
            password='secret123',
        )
        self.client.force_authenticate(user=user)
        payload = {
            'name': 'Admin Forum',
            'description': 'Forum created by an authenticated user',
            'profile_pic': build_test_image("admin-forum.gif"),
            'is_private': False,
        }

        response = self.client.post(reverse('all-forums'), payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        forum = Forum.objects.get(name='Admin Forum')
        forum_user = ForumUser.objects.get(forum=forum, user=user)
        self.assertTrue(forum_user.isAdmin)
