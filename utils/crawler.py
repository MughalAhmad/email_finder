# utils/crawler.py

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from config import (
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    HEADERS,
    CONTACT_KEYWORDS,
)


class WebsiteCrawler:

    def __init__(self, logger):
        self.logger = logger

    def download_page(self, url):
        """
        Download a webpage.
        Returns HTML if successful.
        """

        for attempt in range(MAX_RETRIES):

            try:

                response = requests.get(
                    url,
                    headers=HEADERS,
                    timeout=REQUEST_TIMEOUT,
                    allow_redirects=True,
                )

                if response.status_code == 200:

                    self.logger.info(f"Downloaded: {url}")

                    return response.text

                self.logger.warning(
                    f"{url} returned status {response.status_code}"
                )

            except Exception as ex:

                self.logger.error(f"{url} -> {ex}")

        return None

    def find_contact_pages(self, base_url, html):
        """
        Find internal contact/about pages.
        """

        pages = set()

        # Always include homepage
        pages.add(base_url)

        if not html:
            return list(pages)

        soup = BeautifulSoup(html, "lxml")

        for link in soup.find_all("a", href=True):

            href = link["href"].strip()

            if not href:
                continue

            href_lower = href.lower()

            for keyword in CONTACT_KEYWORDS:

                if keyword in href_lower:

                    absolute_url = urljoin(base_url, href)

                    pages.add(absolute_url)

                    break

        return list(pages)

    def crawl(self, website):
        """
        Download homepage and return pages to scan.
        """

        html = self.download_page(website)

        pages = self.find_contact_pages(
            website,
            html,
        )

        return pages