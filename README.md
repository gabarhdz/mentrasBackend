# Mentras Backend

`Mentras Backend` is a Django REST API that powers a community and operations platform oriented to mentors, moderators, and small business owners. The project combines user management, collaborative forums, and inventory/menu workflows in a single backend designed to support both engagement and day-to-day business activity.

This repository is especially useful to share with recruiters or technical reviewers because it shows practical backend work around authentication, role-aware users, media handling, transactional business logic, and modular API design.

## Project Overview

The backend is structured around three main domains:

- `User management`: account creation, JWT authentication, Google social login, email verification, profile pictures, and role flags such as mentor or SME owner.
- `Community forums`: creation of forums, forum posts, moderation-friendly validations, media-ready forum entities, and profanity filtering on user-generated content.
- `Stock and menus`: item registration, menu composition, stock deduction when items are assigned to menus, and movement logs to track operational actions.

Together, these modules suggest a product that is more than a simple CRUD API. It supports community interaction while also handling operational workflows that matter to small businesses.

## Why This Project Matters

From a recruiter perspective, this project demonstrates:

- Experience building a multi-module backend with clear separation of concerns.
- Practical use of `Django`, `Django REST Framework`, and `PostgreSQL`.
- Implementation of secure authentication with `JWT`.
- Integration of third-party services such as `Cloudinary`, `Google OAuth`, and SMTP email delivery.
- Handling of business rules with transactions and validation, not just data persistence.
- Familiarity with custom permissions, file uploads, serializer-driven APIs, and automated tests.

## Core Features

### 1. Authentication and user lifecycle

- Custom `User` model with UUID primary keys.
- Registration endpoint with email verification code delivery.
- Login and token refresh using `SimpleJWT`.
- Google social authentication via `dj-rest-auth` and `django-allauth`.
- Role support for admin, moderator, mentor, and SME owner profiles.
- Profile image upload and transformation through `Cloudinary`.

### 2. Forum system

- Public listing and creation of forums.
- Forum detail retrieval for authenticated users.
- Post creation and deletion tied to authenticated users.
- Optional forum images hosted on `Cloudinary`.
- Profanity filtering for forum names, descriptions, and post content.
- Support for storing multiple post images as validated JSON.

### 3. Stock and menu workflows

- CRUD-style item and menu creation endpoints.
- Media-backed item images.
- Linking items to menus with quantities.
- Automatic stock deduction when an item is assigned to a menu.
- Movement tracking through a dedicated `MenuMovement` model.
- Access protected by a custom permission requiring verified email addresses.

## Tech Stack

- `Python`
- `Django 6`
- `Django REST Framework`
- `PostgreSQL`
- `SimpleJWT`
- `dj-rest-auth`
- `django-allauth`
- `Cloudinary`
- `SMTP / Gmail`
- `better-profanity`

## Architecture Snapshot

The codebase is organized into Django apps, which makes the domain boundaries easy to follow:

```text
mentrasBackend/
├── apps/
│   ├── user/   # authentication, profile management, email verification
│   ├── forum/  # forums, posts, moderation-oriented validations
│   └── stock/  # items, menus, stock deductions, movement logs
├── globals/    # shared permissions and Cloudinary helpers
├── mentrasBackend/
│   ├── settings.py
│   └── urls.py
└── manage.py
```

This structure makes the project easy to extend and signals a good foundation for future scaling into additional product modules.

## API Highlights

Main route groups:

- `/api/user/`
- `/api/forum/`
- `/api/stock/`
- `/api/accounts/`

Representative endpoints:

- `POST /api/user/` creates a user and sends an email verification code.
- `POST /api/user/login/` issues access and refresh JWT tokens.
- `POST /api/user/activate-email/<uuid:id>/` verifies the user email.
- `GET /api/forum/` lists forums.
- `POST /api/forum/post/` creates a forum post.
- `POST /api/stock/items/` creates an inventory item.
- `POST /api/stock/menus/` creates a menu.
- `POST /api/stock/menus/<uuid:menu_id>/items/` assigns an item to a menu and updates stock.
- `GET /api/stock/menus/<uuid:menu_id>/movements/` returns the movement history for auditability.

## Business Logic Worth Noticing

Some implementation details that are valuable from an engineering standpoint:

- User emails are verified through generated short-lived codes.
- Sensitive API areas rely on authentication and custom permission checks.
- Stock updates are wrapped in database transactions to keep inventory consistent.
- Uploaded images are normalized through Cloudinary transformations.
- Content moderation is embedded in serializers rather than left entirely to the frontend.
- UUID-based identifiers help avoid predictable incremental IDs in public APIs.

## Local Setup

### Prerequisites

- `Python 3.12+` recommended
- `PostgreSQL`
- A configured `Cloudinary` account
- SMTP credentials for outbound email

### Installation

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Environment variables

Create a `.env` file in the project root with values for:

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
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_SECRET=
FACEBOOK_KEY=
MICROSOFT_CLIENT_ID=
MICROSOFT_SECRET=
MICROSOFT_KEY=
```

### Run locally

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Testing

The repository already includes automated tests for parts of the `forum` and `stock` domains. Run them with:

```bash
python manage.py test
```

## What Recruiters Can Take Away

This is not a tutorial-level backend. It shows a developer working across product thinking and implementation details:

- translating a product idea into bounded backend modules,
- designing authenticated REST endpoints,
- integrating external services responsibly,
- modeling business workflows beyond simple CRUD,
- and keeping the codebase structured enough to keep growing.

If you are reviewing this project as a recruiter or hiring manager, the strongest signal is its combination of community features and operational logic in one coherent API.

## Possible Next Steps

If this project continues evolving, strong next improvements would be:

- richer test coverage across authentication and permissions,
- Docker support for easier onboarding,
- API documentation with OpenAPI or Swagger,
- role-based authorization refinement,
- and production-ready environment separation for security settings.
