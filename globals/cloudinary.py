import uuid

import cloudinary.uploader
from rest_framework import serializers


PROFILE_PIC_TRANSFORMATIONS = [
    {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
    {"quality": "auto"},
    {"fetch_format": "auto"},
]


class CloudinaryImageField(serializers.ImageField):
    def to_representation(self, value):
        if isinstance(value, str):
            return value
        return super().to_representation(value)


def upload_profile_pic(
    file,
    *,
    folder,
    public_id=None,
    overwrite=False,
):
    if not file:
        return None

    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        public_id=public_id or str(uuid.uuid4()),
        overwrite=overwrite,
        resource_type="image",
        transformation=PROFILE_PIC_TRANSFORMATIONS,
    )
    return result["secure_url"]
