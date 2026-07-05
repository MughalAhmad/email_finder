import re
from config import IGNORE_EMAILS


class EmailValidator:

    def __init__(self):

        self.pattern = re.compile(
            r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        )

    def is_valid(self, email):

        if not email:
            return False

        email = email.strip().lower()

        if email in IGNORE_EMAILS:
            return False

        if "example." in email:
            return False

        if email.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg")):
            return False

        if email.startswith("@"):
            return False

        if ".." in email:
            return False

        return bool(self.pattern.match(email))

    def clean(self, emails):

        cleaned = set()

        for email in emails:

            email = email.lower().strip()

            if self.is_valid(email):
                cleaned.add(email)

        return sorted(cleaned)