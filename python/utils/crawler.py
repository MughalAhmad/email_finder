# utils/crawler.py

# import requests
from curl_cffi import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import (
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    HEADERS,
    CONTACT_KEYWORDS,
)


class WebsiteCrawler:

    # def __init__(self, logger):
    #     self.logger = logger

    def __init__(self, logger):

        self.logger = logger

        self.session = requests.Session()

        self.session.headers.update(HEADERS)

    # def download_page(self, url):
    #     """
    #     Download a webpage.
    #     Returns HTML if successful.
    #     """

    #     for attempt in range(MAX_RETRIES):

    #         try:

    #             response = requests.get(
    #                 url,
    #                 headers=HEADERS,
    #                 timeout=REQUEST_TIMEOUT,
    #                 allow_redirects=True,
    #             )

    #             if response.status_code == 200:

    #                 self.logger.info(f"Downloaded: {url}")

    #                 return response.text

    #             self.logger.warning(
    #                 f"{url} returned status {response.status_code}"
    #             )

    #         except Exception as ex:

    #             self.logger.error(f"{url} -> {ex}")

    #     return None

    def download_page(self, url):
        """
        Download webpage using a browser-like TLS fingerprint.
        """

        for attempt in range(MAX_RETRIES):

            try:

                # Wait between requests (0.8 - 2 seconds)
                time.sleep(random.uniform(0.8, 2))

                response = self.session.get(
                    url,
                    impersonate="chrome136",
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

    def download_page_worker(self, url):
        """
        Each worker creates its own Session.
        This avoids sharing one Session across threads.
        """

        session = requests.Session()
        session.headers.update(HEADERS)

        for attempt in range(MAX_RETRIES):

            try:

                time.sleep(random.uniform(0.2, 0.5))

                response = session.get(
                    url,
                    impersonate="chrome136",
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
    
    def download_pages(self, pages, max_workers=5):
        """
        Download multiple pages concurrently.
        Returns:
            {
                url: html,
                ...
            }
        """

        results = {}

        if not pages:
            return results

        with ThreadPoolExecutor(max_workers=max_workers) as executor:

            future_map = {
                executor.submit(self.download_page_worker, page): page
                for page in pages
            }

            for future in as_completed(future_map):

                page = future_map[future]

                try:

                    html = future.result()

                    results[page] = html

                except Exception as ex:

                    self.logger.error(f"{page} -> {ex}")

                    results[page] = None

        return results

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

        return pages, html
    
    
    