# config.py

import os

# Request Settings
REQUEST_TIMEOUT = 10
MAX_RETRIES = 2

# User-Agent
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/137.0.0.0 Safari/537.36"
    )
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