from __future__ import annotations

import uuid
from pathlib import Path
from typing import IO

import requests
from django.conf import settings


class SupabaseUploadError(Exception):
    """Raised when Supabase Storage upload fails."""


def _build_target_path(filename: str) -> str:
    extension = Path(filename).suffix
    return f"profile-photos/{uuid.uuid4().hex}{extension}"


def upload_profile_photo(file_obj: IO[bytes]) -> str:
    """Upload file to Supabase Storage using the service-role key."""
    if not settings.SUPABASE_STORAGE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise SupabaseUploadError(
            "Supabase storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )

    bucket = settings.SUPABASE_PROFILE_BUCKET
    key = _build_target_path(file_obj.name)
    upload_url = f"{settings.SUPABASE_STORAGE_URL}/object/{bucket}/{key}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": getattr(file_obj, "content_type", "application/octet-stream"),
    }
    params = {
        "cacheControl": "3600",
        "upsert": "false",
    }

    response = requests.post(upload_url, headers=headers, params=params, data=file_obj.read(), timeout=30)
    if not response.ok:
        detail = ""
        try:
            detail = response.json()
        except ValueError:
            detail = response.text.strip() or response.reason
        raise SupabaseUploadError(f"Supabase upload failed ({response.status_code}): {detail}")

    if not settings.SUPABASE_PUBLIC_STORAGE_URL:
        raise SupabaseUploadError("Supabase public storage URL is not configured.")

    return f"{settings.SUPABASE_PUBLIC_STORAGE_URL}/{key}"
