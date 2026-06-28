# config.py

import os

# Request Settings
REQUEST_TIMEOUT = 10
MAX_RETRIES = 2

# User-Agent
# HEADERS = {
#     "User-Agent": (
#         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#         "AppleWebKit/537.36 (KHTML, like Gecko) "
#         "Chrome/137.0.0.0 Safari/537.36"
#     )
# }

HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
}

# Input / Output
INPUT_FILE = "input.txt"
OUTPUT_FILE = "output.csv"

# Contact Pages
CONTACT_KEYWORDS = [
    "contact",
    "contact-us",
    "contactus",
    "about",
    "about-us",
    "aboutus",
    "team",
    "support",
    "help",
]

# Ignore Emails
IGNORE_EMAILS = {
    "example@example.com",
    "you@example.com",
    "test@test.com",
    "email@example.com",
}

# Log Folder
LOG_FOLDER = "logs"

if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)