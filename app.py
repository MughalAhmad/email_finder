from config import OUTPUT_FILE

from utils.helpers import print_banner, read_input_file
from utils.logger import get_logger
from utils.crawler import WebsiteCrawler
from utils.extractor import EmailExtractor
from utils.csv_writer import CSVWriter
from utils.email_verifier import EmailVerifier

logger = get_logger()

print_banner()

websites = read_input_file("input.txt")

logger.info(f"Found {len(websites)} websites.")

crawler = WebsiteCrawler(logger)
extractor = EmailExtractor()
verifier = EmailVerifier()
writer = CSVWriter(OUTPUT_FILE)
count = 1

for website in websites:

    logger.info("=" * 60)
    logger.info(f"Scanning Website : {website}")

    logger.info(f"Currently scanning website and Number : {count}/{len(websites)} - {website}")

    pages = crawler.crawl(website)

    all_emails = set()

    for page in pages:

        logger.info(f"Checking : {page}")

        html = crawler.download_page(page)

        if not html:
            continue

        emails = extractor.extract_from_html(html)

        all_emails.update(emails)

    writer.write(
        website,
        all_emails,
        verifier
    )

    print("\n-----------------------------------------")
    print("Website :", website)

    if all_emails:

        print("Emails Found:")

        # for email in sorted(all_emails):
        #     print(f"   {email}")
        for email in sorted(all_emails):

            if verifier.verify(email):
                print(f"✅ {email}")
            else:
                print(f"❌ {email}")

    else:

        print("No email found.")

    count += 1

print("\n")
print("=" * 60)
print("Completed Successfully")
print(f"Results saved to {OUTPUT_FILE}")
print("=" * 60)