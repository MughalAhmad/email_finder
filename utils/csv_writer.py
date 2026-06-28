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


import csv
import os


class CSVWriter:

    def __init__(self, filename):

        self.filename = filename

        if not os.path.exists(filename):

            with open(filename, "w", newline="", encoding="utf-8-sig") as file:

                writer = csv.writer(file)

                writer.writerow([
                    "Website",
                    "Emails",
                    "Verification"
                ])

    # def write(self, website, emails, verifier):

    #     verified_result = []

    #     for email in sorted(emails):

    #         if verifier.verify(email):
    #             verified_result.append(f"{email} ✅")
    #         else:
    #             verified_result.append(f"{email} ❌")

    #     with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

    #         writer = csv.writer(file)

    #         # writer.writerow([
    #         #     website,
    #         #     ", ".join(sorted(emails)),
    #         #     ", ".join(verified_result)
    #         # ])

    #         writer.writerow([
    #             website,
    #             "\n".join(sorted(emails)),
    #             "\n".join(verified_result)
    #         ])

    def write(self, website, emails, verifier):

        email_list = []
        verify_list = []

        for email in sorted(emails):

            email_list.append(email)

            if verifier.verify(email):
                verify_list.append("✅")
            else:
                verify_list.append("❌")

        with open(self.filename, "a", newline="", encoding="utf-8-sig") as file:

            writer = csv.writer(file)

            writer.writerow([
                website,
                "\n".join(email_list),
                "\n".join(verify_list)
            ])