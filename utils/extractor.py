# utils/extractor.py

import re
from bs4 import BeautifulSoup
from config import IGNORE_EMAILS
from utils.validator import EmailValidator

class EmailExtractor:

    def __init__(self):

        self.validator = EmailValidator()

        # Email regex
        self.email_pattern = re.compile(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            re.IGNORECASE,
        )

    def extract_from_html(self, html):
        """
        Extract emails from HTML source.
        """

        if not html:
            return []

        emails = set()

        # -------------------------
        # 1. Extract with Regex
        # -------------------------
        found = self.email_pattern.findall(html)

        for email in found:
            emails.add(email.lower())

        # -------------------------
        # 2. Extract mailto:
        # -------------------------
        soup = BeautifulSoup(html, "lxml")

        for a in soup.find_all("a", href=True):

            href = a["href"]

            if href.lower().startswith("mailto:"):

                email = href.replace("mailto:", "")

                email = email.split("?")[0]

                email = email.strip().lower()

                if email:
                    emails.add(email)

        # -------------------------
        # 3. Remove fake emails
        # -------------------------

        return self.validator.clean(emails)
    
        # cleaned = set()

        # for email in emails:

        #     if email in IGNORE_EMAILS:
        #         continue

        #     if "example." in email:
        #         continue

        #     if email.endswith(".png"):
        #         continue

        #     if email.endswith(".jpg"):
        #         continue

        #     if email.endswith(".jpeg"):
        #         continue

        #     cleaned.add(email)

        # return sorted(cleaned)