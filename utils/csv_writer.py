# utils/csv_writer.py

import csv
import os


class CSVWriter:

    def __init__(self, filename):
        self.filename = filename

        # Create header if file doesn't exist
        if not os.path.exists(self.filename):

            with open(self.filename, "w", newline="", encoding="utf-8-sig") as file:

                writer = csv.writer(file)

                writer.writerow([
                    "Website",
                    "Emails",
                    "Total Emails"
                ])

    def write(self, website, emails):

        with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

            writer = csv.writer(file)

            writer.writerow([
                website,
                ", ".join(sorted(emails)),
                len(emails)
            ])