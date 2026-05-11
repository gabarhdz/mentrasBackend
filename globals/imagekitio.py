import os
import uuid

from imagekitio import ImageKit


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


def upload_file_to_imagekit(file, folder, *, public_id=None, overwrite=False):
    if not file:
        return None

    result = imagekit.files.upload(
        file=file,
        file_name=public_id or str(uuid.uuid4()),
        folder=folder,
        use_unique_file_name=not public_id,
        overwrite_file=overwrite,
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
