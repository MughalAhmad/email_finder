# utils/helpers.py

import re
from urllib.parse import urlparse


def normalize_url(url: str) -> str:
    """
    Convert a URL into a standard format.

    Examples:
        google.com
        -> https://google.com

        http://google.com
        -> http://google.com

        https://google.com/
        -> https://google.com
    """

    url = url.strip()

    if not url:
        return None

    # Add https:// if missing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)

    if not parsed.netloc:
        return None

    # Remove trailing slash
    url = url.rstrip("/")

    return url


def is_valid_url(url: str) -> bool:
    """
    Basic URL validation.
    """

    regex = re.compile(
        r"^(https?://)"
        r"([A-Za-z0-9-]+\.)+[A-Za-z]{2,}"
        r"(:\d+)?"
        r"(/.*)?$"
    )

    return bool(regex.match(url))


def read_input_file(filename: str):
    """
    Read websites from input.txt
    """

    websites = []

    with open(filename, "r", encoding="utf-8") as file:

        for line in file:

            line = line.strip()

            if not line:
                continue

            url = normalize_url(line)

            if url and is_valid_url(url):
                websites.append(url)

    # Remove duplicates
    websites = list(dict.fromkeys(websites))

    return websites


def get_domain(url: str) -> str:
    """
    Return only the domain.

    https://google.com/test
    -> google.com
    """

    parsed = urlparse(url)

    return parsed.netloc.lower()


def print_banner():

    print("=" * 60)
    print("           Email Finder")
    print("=" * 60)