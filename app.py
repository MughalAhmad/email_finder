# from config import OUTPUT_FILE

# from utils.helpers import print_banner, read_input_file
# from utils.logger import get_logger
# from utils.crawler import WebsiteCrawler
# from utils.extractor import EmailExtractor
# from utils.csv_writer import CSVWriter
# from utils.email_verifier import EmailVerifier

# logger = get_logger()

# print_banner()

# websites = read_input_file("input.txt")

# logger.info(f"Found {len(websites)} websites.")

# crawler = WebsiteCrawler(logger)
# extractor = EmailExtractor()
# verifier = EmailVerifier()
# writer = CSVWriter(OUTPUT_FILE)

# for website in websites:

#     logger.info("=" * 60)
#     logger.info(f"Scanning Website : {website}")

#     pages = crawler.crawl(website)

#     all_emails = set()

#     for page in pages:

#         logger.info(f"Checking : {page}")

#         html = crawler.download_page(page)

#         if not html:
#             continue

#         emails = extractor.extract_from_html(html)

#         all_emails.update(emails)

#     writer.write(
#         website,
#         all_emails,
#         verifier
#     )

#     print("\n-----------------------------------------")
#     print("Website :", website)

#     if all_emails:

#         print("Emails Found:")

#         # for email in sorted(all_emails):
#         #     print(f"   {email}")
#         for email in sorted(all_emails):

#             if verifier.verify(email):
#                 print(f"✅ {email}")
#             else:
#                 print(f"❌ {email}")

#     else:

#         print("No email found.")

# print("\n")
# print("=" * 60)
# print("Completed Successfully")
# print(f"Results saved to {OUTPUT_FILE}")
# print("=" * 60)


from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import time

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

# -------------------------------------------------------
# Process Single Website
# -------------------------------------------------------


def process_website(website):

    start_time = time.perf_counter()

    # Create separate objects for each thread
    crawler = WebsiteCrawler(logger)
    extractor = EmailExtractor()
    verifier = EmailVerifier()

    logger.info("=" * 60)
    logger.info(f"Scanning Website : {website}")

    try:

        pages = crawler.crawl(website)

        all_emails = set()

        for page in pages:

            logger.info(f"Checking : {page}")

            html = crawler.download_page(page)

            if not html:
                continue

            emails = extractor.extract_from_html(html)

            all_emails.update(emails)

        # Thread-safe CSV write
        with csv_lock:

            writer.write(
                website,
                all_emails,
                verifier
            )

        # Prepare output
        output = []
        output.append("")
        output.append("-----------------------------------------")
        output.append(f"Website : {website}")

        if all_emails:

            output.append("Emails Found:")

            for email in sorted(all_emails):

                if verifier.verify(email):
                    output.append(f"✅ {email}")
                else:
                    output.append(f"❌ {email}")

        else:

            output.append("No email found.")

        elapsed = time.perf_counter() - start_time

        output.append("")
        output.append(f"Completed in {elapsed:.2f} sec")

        # Thread-safe printing
        with print_lock:
            print("\n".join(output))

        logger.info(
            f"Completed {website} in {elapsed:.2f} seconds."
        )

    except Exception as ex:

        logger.exception(f"{website} -> {ex}")


# -------------------------------------------------------
# Main
# -------------------------------------------------------

def main():

    print_banner()

    websites = read_input_file("input.txt")

    logger.info(f"Found {len(websites)} websites.")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

        futures = [
            executor.submit(process_website, website)
            for website in websites
        ]

        for future in as_completed(futures):

            try:
                future.result()
            except Exception as ex:
                logger.exception(ex)

    print()
    print("=" * 60)
    print("Completed Successfully")
    print(f"Results saved to {OUTPUT_FILE}")
    print("=" * 60)


# -------------------------------------------------------

if __name__ == "__main__":
    main()
    