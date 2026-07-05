from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import time
import sys
import json
from config import OUTPUT_FILE

from utils.helpers import print_banner, read_input_file
from utils.logger import get_logger
from utils.crawler import WebsiteCrawler
from utils.extractor import EmailExtractor
from utils.csv_writer import CSVWriter
from utils.email_verifier import EmailVerifier

# -------------------------------------------------------
# Configuration
# -------------------------------------------------------

MAX_WORKERS = 10

logger = get_logger()

csv_lock = Lock()
print_lock = Lock()

writer = CSVWriter(OUTPUT_FILE)
verifier = EmailVerifier()


# -------------------------------------------------------
# Process Single Website
# -------------------------------------------------------


# def process_website(website):

#     start_time = time.perf_counter()

#     # Create separate objects for each thread
#     crawler = WebsiteCrawler(logger)
#     extractor = EmailExtractor()

#     logger.info("=" * 60)
#     logger.info(f"Scanning Website : {website}")

#     try:

#         pages, homepage_html = crawler.crawl(website)

#         all_emails = set()

#         # ---------------------------------------
#         # Scan homepage (already downloaded)
#         # ---------------------------------------

#         if homepage_html:

#             logger.info(f"Checking : {website}")

#             emails = extractor.extract_from_html(homepage_html)

#             all_emails.update(emails)

#         # ---------------------------------------
#         # Remove homepage from pages
#         # ---------------------------------------

#         pages = [page for page in pages if page != website]

#         # ---------------------------------------
#         # Download remaining pages concurrently
#         # ---------------------------------------

#         downloaded_pages = crawler.download_pages(pages, max_workers=min(5, len(pages)))

#         for page, html in downloaded_pages.items():

#             logger.info(f"Checking : {page}")

#             if not html:
#                 continue

#             emails = extractor.extract_from_html(html)

#             all_emails.update(emails)

#         # Thread-safe CSV write
#         with csv_lock:

#             writer.write(
#                 website,
#                 all_emails,
#                 verifier
#             )

#         # Prepare output
#         output = []
#         output.append("")
#         output.append("-----------------------------------------")
#         output.append(f"Website : {website}")

#         if all_emails:

#             output.append("Emails Found:")

#             for email in sorted(all_emails):

#                 if verifier.verify(email):
#                     # output.append(f"✅ {email}")
#                     output.append(f"[VALID] {email}")
#                 else:
#                     # output.append(f"❌ {email}")
#                     output.append(f"[INVALID] {email}")

#         else:

#             output.append("No email found.")

#         elapsed = time.perf_counter() - start_time

#         output.append("")
#         output.append(f"Completed in {elapsed:.2f} sec")

#         # Thread-safe printing
#         # with print_lock:
#         #     print("\n".join(output))

#         logger.info(
#             f"Completed {website} in {elapsed:.2f} seconds."
#         )

#         verified_emails = []

#         for email in sorted(all_emails):

#             verified_emails.append({
#                 "email": email,
#                 "verified": verifier.verify(email)
#             })

#         return {
#             "website": website,
#             "emails": verified_emails,
#             "totalEmails": len(verified_emails),
#             "success": True,
#             "elapsed": round(elapsed, 2)
#         }

#     except Exception as ex:

#         logger.exception(f"{website} -> {ex}")

#         return {
#         "website": website,
#         "success": False,
#         "error": str(ex)
#         }

def process_website(website):

    start_time = time.perf_counter()

    crawler = WebsiteCrawler(logger)
    extractor = EmailExtractor()

    logger.info("=" * 60)
    logger.info(f"Scanning Website : {website}")

    try:

        pages, homepage_html = crawler.crawl(website)

        all_emails = set()

        # ---------------------------------------------------
        # Scan homepage
        # ---------------------------------------------------

        if homepage_html:

            logger.info(f"Checking : {website}")

            emails = extractor.extract_from_html(homepage_html)

            all_emails.update(emails)

        # ---------------------------------------------------
        # Remove homepage
        # ---------------------------------------------------

        pages = [page for page in pages if page != website]

        # ---------------------------------------------------
        # Download remaining pages
        # ---------------------------------------------------

        downloaded_pages = crawler.download_pages(
            pages,
            max_workers=min(5, len(pages))
        )

        for page, html in downloaded_pages.items():

            logger.info(f"Checking : {page}")

            if not html:
                continue

            emails = extractor.extract_from_html(html)

            all_emails.update(emails)

        # ---------------------------------------------------
        # Verify Emails
        # ---------------------------------------------------

        verified_emails = []

        for email in sorted(all_emails):

            verified = verifier.verify(email)

            verified_emails.append({
                "email": email,
                "verified": verified
            })

        # ---------------------------------------------------
        # Write CSV
        # ---------------------------------------------------

        with csv_lock:

            writer.write(
                website,
                all_emails,
                verifier
            )

        elapsed = time.perf_counter() - start_time

        logger.info(
            f"Completed {website} in {elapsed:.2f} seconds."
        )

        return {
            "website": website,
            "success": True,
            "totalEmails": len(verified_emails),
            "emails": verified_emails,
            "elapsed": round(elapsed, 2)
        }

    except Exception as ex:

        logger.exception(f"{website} -> {ex}")

        return {
            "website": website,
            "success": False,
            "emails": [],
            "totalEmails": 0,
            "elapsed": round(time.perf_counter() - start_time, 2),
            "error": str(ex)
        }
    
# -------------------------------------------------------
# Main
# -------------------------------------------------------

# def main():

#     print_banner()

#     websites = read_input_file("input.txt")

#     logger.info(f"Found {len(websites)} websites.")

#     with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

#         futures = [
#             executor.submit(process_website, website)
#             for website in websites
#         ]

#         for future in as_completed(futures):

#             try:
#                 future.result()
#             except Exception as ex:
#                 logger.exception(ex)

#     print()
#     print("=" * 60)
#     print("Completed Successfully")
#     print(f"Results saved to {OUTPUT_FILE}")
#     print("=" * 60)


def scan_websites(websites):

    logger.info(f"Found {len(websites)} websites.")

    results = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

        future_map = {
            executor.submit(process_website, website): website
            for website in websites
        }

        for future in as_completed(future_map):

            website = future_map[future]

            try:

                result = future.result()

                if result:
                    results.append(result)

            except Exception as ex:

                logger.exception(ex)

                results.append({
                    "website": website,
                    "success": False,
                    "error": str(ex)
                })

    return results


def main():

    print_banner()

    websites = read_input_file("input.txt")

    results = scan_websites(websites)

    print()
    print("=" * 60)
    print("Completed Successfully")
    print(f"Results saved to {OUTPUT_FILE}")
    print("=" * 60)

    return results

# -------------------------------------------------------

# if __name__ == "__main__":
#     main()
    
if __name__ == "__main__":

    try:

        data = sys.stdin.read().strip()

        if data:

            request = json.loads(data)

            websites = request.get("websites", [])

            results = scan_websites(websites)

            print(json.dumps({
                "success": True,
                "results": results
            }))

        else:

            main()

    except Exception as ex:

        print(json.dumps({
            "success": False,
            "error": str(ex)
        }))