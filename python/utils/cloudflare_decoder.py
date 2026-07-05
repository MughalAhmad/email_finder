class CloudflareDecoder:

    @staticmethod
    def decode(cfemail: str):

        try:

            r = int(cfemail[:2], 16)

            email = ""

            for i in range(2, len(cfemail), 2):

                email += chr(int(cfemail[i:i + 2], 16) ^ r)

            return email.lower()

        except Exception:

            return None