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

Representative endpoints:

- `POST /api/user/` creates a new user and sends the verification code.
- `POST /api/user/login/` returns access and refresh JWT tokens.
- `POST /api/user/login/refresh/` refreshes the access token.
- `POST /api/user/activate-email/<uuid:id>/` verifies the email with a code.
- `POST /api/user/resend-code/<uuid:id>/` sends a new verification code.
- `POST /api/user/accounts/google/` signs in or registers with Google.
- `GET /api/forum/` lists forums.
- `POST /api/forum/` creates a forum.
- `POST /api/forum/post/` creates a forum post.
- `DELETE /api/forum/post/<uuid:id>/` deletes a post if the requester is the author.
- `POST /api/stock/items/` creates an inventory item.
- `POST /api/stock/menus/` creates a menu.
- `POST /api/stock/menus/<uuid:menu_id>/items/` adds an item to a menu and updates stock.
- `GET /api/stock/menus/<uuid:menu_id>/movements/` returns the audit log for that menu.
- `GET /api/pyme/` lists the authenticated owner’s businesses.
- `POST /api/pyme/` creates a new `Pyme` if the account is marked as a business owner.
- `GET /api/pyme/<uuid:id>/` returns a specific owner-controlled `Pyme`.
- `PATCH /api/pyme/<uuid:id>/` updates a `Pyme`.
- `DELETE /api/pyme/<uuid:id>/` removes a `Pyme`.
- `GET /api/learning/courses/` lists the authenticated mentor’s courses.
- `POST /api/learning/courses/` creates a course for the authenticated mentor.
- `GET /api/learning/courses/<uuid:id>/` returns the full course structure.
- `PATCH /api/learning/courses/<uuid:id>/` updates a course.
- `DELETE /api/learning/courses/<uuid:id>/` deletes a course.
- `GET /api/learning/courses/<uuid:course_id>/units/` lists units for one course.
- `POST /api/learning/courses/<uuid:course_id>/units/` creates a unit in that course.
- `GET /api/learning/units/<uuid:id>/` returns a unit with its lessons.
- `PATCH /api/learning/units/<uuid:id>/` updates a unit.
- `DELETE /api/learning/units/<uuid:id>/` deletes a unit.
- `GET /api/learning/units/<uuid:unit_id>/lessons/` lists lessons for one unit.
- `POST /api/learning/units/<uuid:unit_id>/lessons/` creates a lesson and can upload `video_file` and `pdf_file`.
- `GET /api/learning/lessons/<uuid:id>/` returns a lesson.
- `PATCH /api/learning/lessons/<uuid:id>/` updates a lesson and can replace `video_file` and `pdf_file`.
- `DELETE /api/learning/lessons/<uuid:id>/` deletes a lesson.

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

## Testing

Run the test suite with:

```bash
python manage.py test
```

## What A Recruiter Should Take Away

This project shows a backend developer who can connect product ideas to implementation details. It is not only an authentication demo and not only a CRUD API. It combines:

- user lifecycle management,
- social login,
- role-aware permissions,
- moderated user-generated content,
- media handling,
- operational stock logic,
- and owner-scoped business data.

That mix is valuable because it reflects the kind of real product work teams actually ship: community, operations, permissions, integrations, and maintainable backend structure in one codebase.

## Good Next Improvements

The backend already has a solid base. Logical next steps would be:

- broader automated test coverage, especially around auth and permissions,
- OpenAPI or Swagger documentation,
- product and order endpoints for the `pyme` commerce layer,
- stronger role-based authorization rules,
- and containerized local setup for faster onboarding.
