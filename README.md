# Mentras Backend

`Mentras Backend` is a `Django REST Framework` API for a platform that combines community features with small-business operations. It supports user onboarding, forum-based interaction, inventory and menu workflows, and business-profile management for SME owners.

This repository is a strong portfolio project for recruiters because it goes beyond basic CRUD. It shows authentication, role-aware access, third-party integrations, transactional stock updates, content moderation, media uploads, and a modular backend structure that can grow into a larger product.

## What The Product Does

The backend is designed around a practical idea: one platform where users can participate in communities while business owners manage parts of their operation.

Current implemented domains:

- `Users and access`: account creation, JWT login, email verification, Google login, profile updates, and role flags.
- `Forums`: public forum discovery, forum creation, image-backed forum profiles, posting, and moderation-friendly validation.
- `Inventory and menus`: item registration, menu creation, menu-item assignment, stock deduction, and movement history.
- `PyME management`: creation and maintenance of SME profiles linked to verified owner accounts.
- `Learning`: mentor-scoped course, unit, and lesson management with video/PDF uploads through ImageKit.

There is also data-model groundwork for a future commerce layer through `Product`, `Order`, and `ProductOrder` models in the `pyme` app.

## Why This Project Is Relevant

From an engineering and hiring perspective, this codebase demonstrates:

- building a multi-app backend with clear domain boundaries,
- using a custom `User` model with UUID primary keys,
- implementing `JWT`-based authentication and token refresh,
- integrating external services like `Cloudinary`, `Google OAuth`, and email delivery,
- enforcing business rules with serializer validation and database transactions,
- handling media uploads in API workflows,
- and protecting operational endpoints with custom permissions.

## Main Features

### 1. User accounts and authentication

- Custom `User` model extending `AbstractUser`.
- UUID-based user identifiers.
- Registration endpoint that sends a 6-digit verification code by email.
- Email activation flow with expiration handling.
- JWT login and refresh using `SimpleJWT`.
- Google sign-in flow that verifies the Google ID token server-side.
- Profile editing and self-service account deletion.
- Role flags such as `is_admin`, `is_mod`, `is_mentor`, and `is_pyme_owner`.

### 2. Community forums

- Forum listing and creation.
- Forum detail retrieval for authenticated users.
- Optional forum profile image upload through `Cloudinary`.
- Automatic creation of a `ForumUser` admin relationship when an authenticated user creates a forum.
- Post creation tied to the authenticated author.
- Optional post image lists stored as validated JSON.
- Profanity filtering on forum names, descriptions, post titles, and post text.
- Author-only deletion for posts.

### 3. Inventory and menu operations

- Item creation with image upload.
- Menu creation and retrieval.
- Menu composition through `MenuItem`.
- Stock deduction when an item is attached to a menu.
- Inventory protection against insufficient stock.
- Atomic write flow so stock and menu assignment remain consistent.
- `MenuMovement` audit trail capturing who performed an action, what changed, and when.

### 4. SME / PyME ownership module

- Verified business owners can create and manage their own `Pyme` records.
- Each `Pyme` supports category linkage, profile image, description, and foundation date.
- Owners can list only their own businesses and update or delete them.
- Access is restricted so one owner cannot read or mutate another owner’s `Pyme`.

## Architecture

The repository is organized as separate Django apps, which keeps the product domains easy to understand and extend:

```text
mentrasBackend/
├── apps/
│   ├── user/    # auth, profiles, email verification, Google login
│   ├── forum/   # forums, posts, moderation, forum membership/admin links
│   ├── stock/   # items, menus, stock deduction, movement logs
│   ├── pyme/    # SME profiles and future commerce groundwork
│   └── learning/ # mentor courses, units, lessons, and media uploads
├── globals/     # shared helpers for permissions, tokens, media uploads
├── mentrasBackend/
│   ├── settings.py
│   └── urls.py
└── manage.py
```

This structure is one of the strongest signals in the project: the backend is not written as a single monolith file set, but as separate functional modules with focused responsibilities.

## API Overview

Base route groups:

- `/api/user/`
- `/api/forum/`
- `/api/stock/`
- `/api/pyme/`
- `/api/accounts/`

## Endpoint Examples

The examples below use realistic payloads so the API is easier to read at a glance. UUID values are sample values.

Authentication notes:

- Endpoints under `stock` and `pyme` require an authenticated user with `is_email_verified=true`.
- `GET /api/forum/` and `GET /api/forum/post/` are public.
- Forum and post creation only make sense when the request is authenticated.
- Any endpoint with `profile_pic` is typically sent as `multipart/form-data`. A JSON example is still included here to show the field shape.

### User endpoints

#### `GET /api/user/`

Returns all users.

```json
[
  {
    "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "username": "maria_dev",
    "email": "maria@example.com",
    "phone_number": 88887777,
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
    "is_mod": false,
    "is_admin": false,
    "is_mentor": true,
    "is_pyme_owner": true
  }
]
```

#### `POST /api/user/`

Creates a user and sends a verification code by email.

Request:

```json
{
  "username": "maria_dev",
  "email": "maria@example.com",
  "phone_number": 88887777,
  "password": "StrongPass123!",
  "is_mod": false,
  "is_admin": false,
  "is_mentor": true,
  "is_pyme_owner": true
}
```

Response:

```json
{
  "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "username": "maria_dev",
  "email": "maria@example.com",
  "phone_number": 88887777,
  "profile_pic": "",
  "is_mod": false,
  "is_admin": false,
  "is_mentor": true,
  "is_pyme_owner": true
}
```

#### `GET /api/user/<uuid:id>/`

Returns one user profile.

```json
{
  "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "username": "maria_dev",
  "email": "maria@example.com",
  "phone_number": 88887777,
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
  "is_mod": false,
  "is_admin": false,
  "is_mentor": true,
  "is_pyme_owner": true
}
```

#### `PATCH /api/user/<uuid:id>/`

Updates the authenticated user.

Request:

```json
{
  "phone_number": 88880000,
  "is_mentor": false
}
```

Response:

```json
{
  "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "username": "maria_dev",
  "email": "maria@example.com",
  "phone_number": 88880000,
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
  "is_mod": false,
  "is_admin": false,
  "is_mentor": false,
  "is_pyme_owner": true
}
```

#### `DELETE /api/user/<uuid:id>/`

Deletes the authenticated user if the UUID matches the logged-in account.

```json
{
  "status": "User deleted successfully"
}
```

#### `POST /api/user/login/`

JWT login.

Request:

```json
{
  "username": "maria_dev",
  "password": "StrongPass123!"
}
```

Response:

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token"
}
```

#### `POST /api/user/login/refresh/`

Refreshes the access token.

Request:

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token"
}
```

Response:

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-access-token"
}
```

#### `POST /api/user/activate-email/<uuid:id>/`

Marks the user as verified if the code is correct and not expired.

Request:

```json
{
  "code": "483921"
}
```

Response:

```json
{
  "status": "Email verified successfully"
}
```

#### `POST /api/user/resend-code/<uuid:id>/`

Sends a new verification code.

```json
{
  "status": "Verification code resent successfully"
}
```

#### `POST /api/user/accounts/google/`

Accepts either `id_token` or `credential`.

Request:

```json
{
  "credential": "google-id-token-from-frontend"
}
```

Response:

```json
{
  "user": {
    "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "username": "maria-dev",
    "email": "maria@example.com",
    "first_name": "Maria Dev"
  },
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token"
  },
  "created": true
}
```

### Forum endpoints

#### `GET /api/forum/`

Lists forums ordered by newest first.

```json
[
  {
    "id": "a6cb5f32-e8e8-4315-ae75-0e0fe6c23f2c",
    "name": "Backend Costa Rica",
    "description": "A place to discuss Django, APIs, and deployment.",
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/forum_pics/backend-cr.jpg",
    "is_private": false,
    "created_at": "2026-04-28T10:30:00Z"
  }
]
```

#### `POST /api/forum/`

Creates a forum. If the request is authenticated, the creator is also linked as forum admin.

Request:

```json
{
  "name": "Backend Costa Rica",
  "description": "A place to discuss Django, APIs, and deployment.",
  "is_private": false
}
```

Response:

```json
{
  "id": "a6cb5f32-e8e8-4315-ae75-0e0fe6c23f2c",
  "name": "Backend Costa Rica",
  "description": "A place to discuss Django, APIs, and deployment.",
  "profile_pic": "",
  "is_private": false,
  "created_at": "2026-04-28T10:30:00Z"
}
```

#### `GET /api/forum/<uuid:id>/`

Returns one forum.

```json
{
  "id": "a6cb5f32-e8e8-4315-ae75-0e0fe6c23f2c",
  "name": "Backend Costa Rica",
  "description": "A place to discuss Django, APIs, and deployment.",
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/forum_pics/backend-cr.jpg",
  "is_private": false,
  "created_at": "2026-04-28T10:30:00Z"
}
```

#### `POST /api/forum/<uuid:id>/`

Used as a partial update route for a forum.

Request:

```json
{
  "description": "A place to discuss Django, DRF, APIs, testing, and deployment.",
  "is_private": true
}
```

#### `GET /api/forum/post/`

Lists posts ordered by newest first.

```json
[
  {
    "id": "72bb4ecb-95b2-4a97-9c5f-6efff5d8d952",
    "title": "How are you handling serializer validation?",
    "text": "I moved profanity and image checks into the serializer layer.",
    "user": {
      "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
      "username": "maria_dev",
      "email": "maria@example.com",
      "phone_number": 88887777,
      "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
      "is_mod": false,
      "is_admin": false,
      "is_mentor": true,
      "is_pyme_owner": true
    },
    "images": "[\"https://cdn.example.com/posts/validation-board.png\"]",
    "created_at": "2026-04-28T11:00:00Z",
    "forum_id": 0
  }
]
```

#### `POST /api/forum/post/`

Creates a post inside a forum.

Request:

```json
{
  "forum_id": "a6cb5f32-e8e8-4315-ae75-0e0fe6c23f2c",
  "title": "How are you handling serializer validation?",
  "text": "I moved profanity and image checks into the serializer layer.",
  "images": "[\"https://cdn.example.com/posts/validation-board.png\"]"
}
```

Response:

```json
{
  "id": "72bb4ecb-95b2-4a97-9c5f-6efff5d8d952",
  "title": "How are you handling serializer validation?",
  "text": "I moved profanity and image checks into the serializer layer.",
  "user": {
    "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "username": "maria_dev",
    "email": "maria@example.com",
    "phone_number": 88887777,
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
    "is_mod": false,
    "is_admin": false,
    "is_mentor": true,
    "is_pyme_owner": true
  },
  "images": "[\"https://cdn.example.com/posts/validation-board.png\"]",
  "created_at": "2026-04-28T11:00:00Z",
  "forum_id": 0
}
```

#### `GET /api/forum/post/<uuid:id>/`

Returns one post.

```json
{
  "id": "72bb4ecb-95b2-4a97-9c5f-6efff5d8d952",
  "title": "How are you handling serializer validation?",
  "text": "I moved profanity and image checks into the serializer layer.",
  "user": {
    "id": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "username": "maria_dev",
    "email": "maria@example.com",
    "phone_number": 88887777,
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/profile_pics/maria.jpg",
    "is_mod": false,
    "is_admin": false,
    "is_mentor": true,
    "is_pyme_owner": true
  },
  "images": "[\"https://cdn.example.com/posts/validation-board.png\"]",
  "created_at": "2026-04-28T11:00:00Z",
  "forum_id": 0
}
```

#### `DELETE /api/forum/post/<uuid:id>/`

Deletes the post if the requester is the author.

Successful response:

```json
{}
```

### Stock endpoints

#### `GET /api/stock/items/`

Lists available inventory items.

```json
[
  {
    "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
    "name": "Cold Brew Bottle",
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
    "price": "4.50",
    "stock": 120
  }
]
```

#### `POST /api/stock/items/`

Creates an inventory item.

Request:

```json
{
  "name": "Cold Brew Bottle",
  "profile_pic": "<multipart file>",
  "price": "4.50",
  "stock": 120
}
```

Response:

```json
{
  "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
  "name": "Cold Brew Bottle",
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
  "price": "4.50",
  "stock": 120
}
```

#### `GET /api/stock/menus/`

Lists menus with their attached items and movement history.

```json
[
  {
    "id": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
    "name": "Breakfast Menu",
    "description": "Morning drinks and sandwiches.",
    "menu_items": [
      {
        "id": "f3d504ca-177e-4b97-b4fc-7741a0af7ed8",
        "menu": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
        "item": {
          "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
          "name": "Cold Brew Bottle",
          "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
          "price": "4.50",
          "stock": 118
        },
        "quantity": 2
      }
    ],
    "movements": []
  }
]
```

#### `POST /api/stock/menus/`

Creates a menu.

Request:

```json
{
  "name": "Breakfast Menu",
  "description": "Morning drinks and sandwiches."
}
```

Response:

```json
{
  "id": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
  "name": "Breakfast Menu",
  "description": "Morning drinks and sandwiches.",
  "menu_items": [],
  "movements": []
}
```

#### `POST /api/stock/menus/<uuid:menu_id>/items/`

Attaches an item to a menu and deducts stock atomically.

Request:

```json
{
  "item_id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
  "quantity": 2
}
```

Response:

```json
{
  "id": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
  "name": "Breakfast Menu",
  "description": "Morning drinks and sandwiches.",
  "menu_items": [
    {
      "id": "f3d504ca-177e-4b97-b4fc-7741a0af7ed8",
      "menu": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
      "item": {
        "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
        "name": "Cold Brew Bottle",
        "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
        "price": "4.50",
        "stock": 118
      },
      "quantity": 2
    }
  ],
  "movements": [
    {
      "id": "91ed74f2-150d-49f5-ae30-249f67d8bc5f",
      "menu": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
      "menu_name": "Breakfast Menu",
      "item": {
        "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
        "name": "Cold Brew Bottle",
        "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
        "price": "4.50",
        "stock": 118
      },
      "item_name": "Cold Brew Bottle",
      "menu_item": "f3d504ca-177e-4b97-b4fc-7741a0af7ed8",
      "performed_by": "maria_dev",
      "action": "item_added",
      "action_display": "Item added",
      "quantity": 2,
      "previous_quantity": null,
      "details": "Added Cold Brew Bottle to Breakfast Menu",
      "created_at": "2026-04-28T11:20:00Z"
    }
  ]
}
```

#### `GET /api/stock/menus/<uuid:menu_id>/movements/`

Returns the movement log for a menu.

```json
[
  {
    "id": "91ed74f2-150d-49f5-ae30-249f67d8bc5f",
    "menu": "bc7797e9-a4b7-4cae-99d8-a0f5b95b2d22",
    "menu_name": "Breakfast Menu",
    "item": {
      "id": "fe2d0b9a-59ca-4dc6-b6f6-7c5e1772f2df",
      "name": "Cold Brew Bottle",
      "profile_pic": "https://res.cloudinary.com/demo/image/upload/item_pics/cold-brew.jpg",
      "price": "4.50",
      "stock": 118
    },
    "item_name": "Cold Brew Bottle",
    "menu_item": "f3d504ca-177e-4b97-b4fc-7741a0af7ed8",
    "performed_by": "maria_dev",
    "action": "item_added",
    "action_display": "Item added",
    "quantity": 2,
    "previous_quantity": null,
    "details": "Added Cold Brew Bottle to Breakfast Menu",
    "created_at": "2026-04-28T11:20:00Z"
  }
]
```

### PyME endpoints

#### `GET /api/pyme/`

Lists the authenticated owner's businesses.

```json
[
  {
    "id": "daf8a111-8c82-49bf-8462-e6fc3757d4cb",
    "name": "Cafe Aurora",
    "description": "Specialty coffee, bakery, and brunch.",
    "owner": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "category": {
      "id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
      "name": "Food & Beverage"
    },
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/pyme_pics/cafe-aurora.jpg",
    "access_date": "2026-04-28T09:00:00Z",
    "foundation_date": "2020-05-14"
  }
]
```

#### `GET /api/pyme/my/`

Returns the same owner-scoped list in a dedicated route.

```json
[
  {
    "id": "daf8a111-8c82-49bf-8462-e6fc3757d4cb",
    "name": "Cafe Aurora",
    "description": "Specialty coffee, bakery, and brunch.",
    "owner": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
    "category": {
      "id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
      "name": "Food & Beverage"
    },
    "profile_pic": "https://res.cloudinary.com/demo/image/upload/pyme_pics/cafe-aurora.jpg",
    "access_date": "2026-04-28T09:00:00Z",
    "foundation_date": "2020-05-14"
  }
]
```

#### `POST /api/pyme/`

Creates a business profile. The account must have `is_pyme_owner=true`.

Request:

```json
{
  "name": "Cafe Aurora",
  "description": "Specialty coffee, bakery, and brunch.",
  "category_id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
  "profile_pic": "<multipart file>",
  "foundation_date": "2020-05-14"
}
```

Response:

```json
{
  "id": "daf8a111-8c82-49bf-8462-e6fc3757d4cb",
  "name": "Cafe Aurora",
  "description": "Specialty coffee, bakery, and brunch.",
  "owner": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "category": {
    "id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
    "name": "Food & Beverage"
  },
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/pyme_pics/cafe-aurora.jpg",
  "access_date": "2026-04-28T09:00:00Z",
  "foundation_date": "2020-05-14"
}
```

#### `GET /api/pyme/<uuid:id>/`

Returns one owner-controlled business.

```json
{
  "id": "daf8a111-8c82-49bf-8462-e6fc3757d4cb",
  "name": "Cafe Aurora",
  "description": "Specialty coffee, bakery, and brunch.",
  "owner": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "category": {
    "id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
    "name": "Food & Beverage"
  },
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/pyme_pics/cafe-aurora.jpg",
  "access_date": "2026-04-28T09:00:00Z",
  "foundation_date": "2020-05-14"
}
```

#### `PATCH /api/pyme/<uuid:id>/`

Updates a business profile.

Request:

```json
{
  "description": "Specialty coffee, bakery, brunch, and seasonal desserts.",
  "foundation_date": "2020-05-20"
}
```

Response:

```json
{
  "id": "daf8a111-8c82-49bf-8462-e6fc3757d4cb",
  "name": "Cafe Aurora",
  "description": "Specialty coffee, bakery, brunch, and seasonal desserts.",
  "owner": "8d54c72f-cd39-4d42-8c15-9a865f1f5d1d",
  "category": {
    "id": "d51f8b87-0ec7-4e95-b0de-f4d0d0ce649d",
    "name": "Food & Beverage"
  },
  "profile_pic": "https://res.cloudinary.com/demo/image/upload/pyme_pics/cafe-aurora.jpg",
  "access_date": "2026-04-28T09:00:00Z",
  "foundation_date": "2020-05-20"
}
```

#### `DELETE /api/pyme/<uuid:id>/`

Deletes the business profile.

Successful response:

```json
{}
```

## Engineering Details Worth Noticing

These are the kinds of implementation details that matter in a technical review:

- `UUIDs` are used across the main entities instead of predictable incremental IDs.
- Email verification is part of the account lifecycle, not an afterthought.
- Google authentication is validated on the backend rather than blindly trusted from the client.
- Media uploads are abstracted through shared Cloudinary helpers.
- Forum and post moderation rules live in serializers, which keeps the API defensive.
- Inventory changes use `transaction.atomic()` and stock-level checks to avoid inconsistent writes.
- Operational activity is logged through `MenuMovement`, which adds auditability to menu changes.
- The `IsEmailVerified` permission guards business-sensitive endpoints.

## Tech Stack

- `Python`
- `Django`
- `Django REST Framework`
- `PostgreSQL`
- `djangorestframework-simplejwt`
- `dj-rest-auth`
- `django-allauth`
- `Cloudinary`
- `ImageKit`
- `Google OAuth`
- `better-profanity`

## Local Setup

### Prerequisites

- `Python 3.12+`
- `PostgreSQL`
- a `Cloudinary` account
- SMTP credentials for sending verification emails

### Install dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Environment variables

Create a `.env` file in the project root:

```env
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_PORT=
SECRET_JWT_KEY=
GOOGLE_APP_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
IMAGEKIT_PRIVATE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_SECRET=
FACEBOOK_KEY=
MICROSOFT_CLIENT_ID=
MICROSOFT_SECRET=
MICROSOFT_KEY=
```

### Run the project

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.
