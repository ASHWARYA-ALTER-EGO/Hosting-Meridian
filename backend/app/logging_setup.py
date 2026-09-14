"""One place to configure structured logging."""
import logging
import sys
import os

_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()


class _Formatter(logging.Formatter):
    def format(self, record):
        base = f"{self.formatTime(record, '%H:%M:%S')} {record.levelname:5} {record.name:20} {record.getMessage()}"
        if record.exc_info:
            base += "\n" + self.formatException(record.exc_info)
        return base


def setup_logging():
    root = logging.getLogger()
    if root.handlers:
        return
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(_Formatter())
    root.addHandler(h)
    root.setLevel(_LEVEL)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
