from typing import Any, Optional


class AppError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found", details: Optional[dict] = None):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=404,
            details=details,
        )


class ValidationError(AppError):
    def __init__(self, message: str = "Validation error", details: Optional[dict] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
        )


class AIUnavailableError(AppError):
    def __init__(self, message: str = "AI service is currently unavailable. Please try again later or fill fields manually."):
        super().__init__(
            code="AI_UNAVAILABLE",
            message=message,
            status_code=503,
            details={"endpoint": "ollama"},
        )


class AITimeoutError(AppError):
    def __init__(self, timeout_seconds: int = 120):
        super().__init__(
            code="AI_TIMEOUT",
            message="AI analysis took too long. Please try again.",
            status_code=504,
            details={"timeout_seconds": timeout_seconds},
        )


class AIInvalidResponseError(AppError):
    def __init__(self, message: str = "AI returned an invalid response. Please retry or fill fields manually."):
        super().__init__(
            code="AI_INVALID_JSON",
            message=message,
            status_code=502,
        )


class UploadTooLargeError(AppError):
    def __init__(self, max_bytes: int, received_bytes: int):
        super().__init__(
            code="UPLOAD_TOO_LARGE",
            message=f"File size exceeds the maximum allowed size of {max_bytes // (1024 * 1024)} MB.",
            status_code=413,
            details={"max_bytes": max_bytes, "received_bytes": received_bytes},
        )


class UploadInvalidTypeError(AppError):
    def __init__(self, received_type: str):
        super().__init__(
            code="UPLOAD_INVALID_TYPE",
            message="Unsupported file type. Allowed: JPEG, PNG, WebP.",
            status_code=415,
            details={"received_type": received_type},
        )
