# import re
# import dns.resolver


# class EmailVerifier:

#     EMAIL_REGEX = re.compile(
#         r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
#     )

#     @staticmethod
#     def verify(email: str) -> bool:
#         """
#         Returns True if:
#         1. Email format is valid.
#         2. Domain has MX records.
#         """

#         email = email.strip().lower()

#         # Validate format
#         if not EmailVerifier.EMAIL_REGEX.match(email):
#             return False

#         domain = email.split("@")[1]

#         try:
#             mx_records = dns.resolver.resolve(domain, "MX")
#             return len(mx_records) > 0
#         except Exception:
#             return False

import re
import threading
import dns.resolver


class EmailVerifier:

    EMAIL_REGEX = re.compile(
        r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    )

    def __init__(self):

        # Cache:
        # {
        #     "gmail.com": True,
        #     "abc.com": False
        # }
        self.mx_cache = {}

        self.lock = threading.Lock()

    def verify(self, email: str) -> bool:

        email = email.strip().lower()

        if not self.EMAIL_REGEX.match(email):
            return False

        domain = email.split("@")[1]

        # -----------------------
        # Cache hit
        # -----------------------

        with self.lock:

            if domain in self.mx_cache:
                return self.mx_cache[domain]

        # -----------------------
        # DNS Lookup
        # -----------------------

        try:

            mx = dns.resolver.resolve(domain, "MX")

            result = len(mx) > 0

        except Exception:

            result = False

        # -----------------------
        # Save cache
        # -----------------------

        with self.lock:

            self.mx_cache[domain] = result

        return result