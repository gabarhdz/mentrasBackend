import os
import tempfile
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

import httpx
from imagekitio import ImageKit


DEFAULT_IMAGEKIT_UPLOAD_TIMEOUT_SECONDS = 600.0
DEFAULT_IMAGEKIT_AUTH_EXPIRE_SECONDS = 1800


imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY"),
)


def _extract_uploaded_url(result):
    if result is None:
        return None

    if isinstance(result, dict):
        response = result.get("response")
        if isinstance(response, dict):
            return response.get("url") or response.get("secure_url")
        return result.get("url") or result.get("secure_url")

    response = getattr(result, "response", None)
    if isinstance(response, dict):
        return response.get("url") or response.get("secure_url")

    for attr in ("url", "secure_url"):
        value = getattr(result, attr, None)
        if value:
            return value

    if response is not None:
        for attr in ("url", "secure_url"):
            value = getattr(response, attr, None)
            if value:
                return value

    return None


def _resolve_file_suffix(file):
    file_name = getattr(file, "name", "")
    return Path(file_name).suffix.lower()


def _build_upload_file_name(file, public_id=None):
    suffix = _resolve_file_suffix(file)
    base_name = public_id or str(uuid.uuid4())

    if suffix and Path(base_name).suffix.lower() != suffix:
        return f"{base_name}{suffix}"

    return base_name


def _get_upload_timeout():
    raw_timeout = os.environ.get("IMAGEKIT_UPLOAD_TIMEOUT_SECONDS")
    if not raw_timeout:
        timeout_seconds = DEFAULT_IMAGEKIT_UPLOAD_TIMEOUT_SECONDS
    else:
        timeout_seconds = float(raw_timeout)

    return httpx.Timeout(connect=10.0, read=timeout_seconds, write=timeout_seconds, pool=timeout_seconds)


def get_upload_authentication():
    public_key = os.getenv("IMAGEKIT_PUBLIC_KEY")
    if not public_key:
        raise ValueError("IMAGEKIT_PUBLIC_KEY is not configured")

    expires_in_seconds = int(
        os.environ.get("IMAGEKIT_AUTH_EXPIRE_SECONDS", DEFAULT_IMAGEKIT_AUTH_EXPIRE_SECONDS)
    )
    expire_at = int(time.time()) + expires_in_seconds

    return {
        **imagekit.helper.get_authentication_parameters(
            expire=expire_at
        ),
        "publicKey": public_key,
        "urlEndpoint": os.environ.get("IMAGEKIT_URL_ENDPOINT", ""),
    }


def _write_uploaded_file(file, destination):
    if hasattr(file, "seek"):
        file.seek(0)

    with open(destination, "wb") as temp_file:
        if hasattr(file, "chunks"):
            for chunk in file.chunks():
                temp_file.write(chunk)
            return

        temp_file.write(file.read())


@contextmanager
def _temporary_upload_path(file):
    if hasattr(file, "temporary_file_path"):
        yield Path(file.temporary_file_path())
        return

    suffix = _resolve_file_suffix(file)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = Path(temp_file.name)
    temp_file.close()

    try:
        _write_uploaded_file(file, temp_path)
        yield temp_path
    finally:
        temp_path.unlink(missing_ok=True)


def upload_file_to_imagekit(file, folder, *, public_id=None, overwrite=False):
    if not file:
        return None

    upload_name = _build_upload_file_name(file, public_id=public_id)

    with _temporary_upload_path(file) as temp_path:
        result = imagekit.files.upload(
            file=temp_path,
            file_name=upload_name,
            folder=folder,
            use_unique_file_name=not public_id,
            overwrite_file=overwrite,
            timeout=_get_upload_timeout(),
        )

    return _extract_uploaded_url(result)


def upload_video(file, folder, public_id=None, overwrite=False):
    return upload_file_to_imagekit(
        file,
        folder,
        public_id=public_id,
        overwrite=overwrite,
    )


def upload_document(file, folder, public_id=None, overwrite=False):
    return upload_file_to_imagekit(
        file,
        folder,
        public_id=public_id,
        overwrite=overwrite,
    )
