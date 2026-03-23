"""
Logging configuration.
- development: colored, human-readable console output
- production: JSON structured logs (compatible with Datadog, Loki, CloudWatch)
"""

import logging
import sys
from typing import Any


class _JsonFormatter(logging.Formatter):
    """Minimal JSON log formatter - no extra deps required."""

    def format(self, record: logging.LogRecord) -> str:
        import json
        import traceback

        payload: dict[str, Any] = {
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Extra fields passed via `extra={}` in log calls
        for key, val in record.__dict__.items():
            if key not in {
                "args",
                "asctime",
                "created",
                "exc_info",
                "exc_text",
                "filename",
                "funcName",
                "id",
                "levelname",
                "levelno",
                "lineno",
                "module",
                "msecs",
                "message",
                "msg",
                "name",
                "pathname",
                "process",
                "processName",
                "relativeCreated",
                "stack_info",
                "thread",
                "threadName",
                "taskName",
            }:
                payload[key] = val

        if record.exc_info:
            payload["exception"] = traceback.format_exception(*record.exc_info)

        return json.dumps(payload, default=str)


def configure_logging() -> None:
    from app.core.config import settings

    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)

    if settings.LOG_FORMAT == "json":
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
                datefmt="%H:%M:%S",
            )
        )

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # Quiet noisy third-party loggers
    for noisy in ("uvicorn.access", "httpx", "boto3", "botocore", "s3transfer"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
