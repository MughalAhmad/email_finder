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
INPUT_FILE = "python/input.txt"
OUTPUT_FILE = "python/output.csv"

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
    "write for us",
    "guest post",
    "submit a guest post",
    "contribute to our site",
    "guest post by",
    "become a contributor",
    "guest blogging opportunities",
    "submit an article",
    "accepting guest posts",
    "guest post guidelines",
    "become a guest blogger",
    "contribute your content",
    "submit guest post",
    "guest author",
    "want to write for",
    "guest column",
    "write for me",
    "editorial guidelines",
    "submit news",
    "this is a guest post by",
    "contribute to our blog",
    "guest post courtesy of",
    "guest post opportunities",
    "submit blog post",
    "guest post search",
    "become an author",
    "submit your story",
    "looking for guest posts",
    "send your content",
    "guest blogger",
    "write for our blog",
    "submit article",
    "contribute an article",
    "guest post contributor",
    "become a writer",
    "submit your content",
    "write for our website",
    "guest blogging sites",
    "blogs that accept guest posts",
    "guest post outreach",
    "suggest a post",
    "work with us",
    "contribute to our column",
    "guest posts wanted",
    "guest contributor",
    "submit a story",
    "add a post",
    "write for us page",
    "submit post",
    "guest posts welcome",
    "send a post",
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