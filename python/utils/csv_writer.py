# # utils/csv_writer.py

# import csv
# import os


# class CSVWriter:

#     def __init__(self, filename):
#         self.filename = filename

#         # Create header if file doesn't exist
#         if not os.path.exists(self.filename):

#             with open(self.filename, "w", newline="", encoding="utf-8-sig") as file:

#                 writer = csv.writer(file)

#                 writer.writerow([
#                     "Website",
#                     "Emails",
#                     "Total Emails"
#                 ])

#     def write(self, website, emails):

#         with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

#             writer = csv.writer(file)

#             writer.writerow([
#                 website,
#                 ", ".join(sorted(emails)),
#                 len(emails)
#             ])

# -------------------------------------------------------------------------------------------------------------
# import csv
# import os


# class CSVWriter:

#     def __init__(self, filename):

#         self.filename = filename

#         if not os.path.exists(filename):

#             with open(filename, "w", newline="", encoding="utf-8-sig") as file:

#                 writer = csv.writer(file)

#                 writer.writerow([
#                     "Website",
#                     "Emails",
#                     "Verification"
#                 ])

#     # def write(self, website, emails, verifier):

#     #     verified_result = []

#     #     for email in sorted(emails):

#     #         if verifier.verify(email):
#     #             verified_result.append(f"{email} ✅")
#     #         else:
#     #             verified_result.append(f"{email} ❌")

#     #     with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

#     #         writer = csv.writer(file)

#     #         # writer.writerow([
#     #         #     website,
#     #         #     ", ".join(sorted(emails)),
#     #         #     ", ".join(verified_result)
#     #         # ])

#     #         writer.writerow([
#     #             website,
#     #             "\n".join(sorted(emails)),
#     #             "\n".join(verified_result)
#     #         ])

#     def write(self, website, emails, verifier):

#         email_list = []
#         verify_list = []

#         for email in sorted(emails):

#             email_list.append(email)

#             if verifier.verify(email):
#                 verify_list.append("✅")
#             else:
#                 verify_list.append("❌")

#         with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

#             writer = csv.writer(file)

#             writer.writerow([
#                 website,
#                 "\n".join(email_list),
#                 "\n".join(verify_list)
#             ])
# ------------------------------------------------------------------------------------------------------------------

import csv
import os
import threading


class CSVWriter:

    def __init__(self, filename):

        self.filename = filename
        self.lock = threading.Lock()

        file_exists = os.path.exists(filename)

        self.file = open(
            filename,
            "a",
            newline="",
            encoding="utf-8-sig"
        )

        self.writer = csv.writer(self.file)

        if not file_exists:

            self.writer.writerow([
                "Website",
                "Emails",
                "Verification"
            ])

            self.file.flush()

    def write(self, website, emails, verifier):

        email_list = []
        verify_list = []

        for email in sorted(emails):

            email_list.append(email)

            verify_list.append(
                "✅" if verifier.verify(email) else "❌"
            )

        with self.lock:

            self.writer.writerow([
                website,
                "\n".join(email_list),
                "\n".join(verify_list)
            ])

            # Immediately save to disk
            self.file.flush()

    def close(self):

        self.file.close()