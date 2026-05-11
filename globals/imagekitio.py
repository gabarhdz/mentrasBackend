import os
import uuid
from imagekitio import ImageKit

imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY")
)

# Store URL endpoint for reuse
URL_ENDPOINT = os.environ.get("IMAGEKIT_URL_ENDPOINT")

def upload_video(file, folder, public_id=None):
    if not file:
        return None

    result = imagekit.upload_file(
        file=file,
        file_name=public_id or str(uuid.uuid4()),
        options={
            "folder": folder,
            "resource_type": "video",
        },
    )
    return result["response"]["url"]