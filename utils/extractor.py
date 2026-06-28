# utils/extractor.py

import re
from bs4 import BeautifulSoup
from config import IGNORE_EMAILS
from utils.validator import EmailValidator
from utils.email_verifier import EmailVerifier
from utils.cloudflare_decoder import CloudflareDecoder
class EmailExtractor:

    def __init__(self):

        self.validator = EmailValidator()

        self.verifier = EmailVerifier()

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

        # Save the downloaded HTML for debugging
        with open("debug.html", "w", encoding="utf-8") as f:
            f.write(html)

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
        # 3. Decode Cloudflare Emails
        # -------------------------

        for tag in soup.select(".__cf_email__"):

            cfemail = tag.get("data-cfemail")

            if not cfemail:
                continue

            email = CloudflareDecoder.decode(cfemail)

            if email:
                emails.add(email)

        # -------------------------
        # 4. Remove fake emails
        # -------------------------

        valid_emails = []

        for email in self.validator.clean(emails):

            if self.verifier.verify(email):
                valid_emails.append(email)

        return sorted(valid_emails)

        # return self.validator.clean(emails)
    
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