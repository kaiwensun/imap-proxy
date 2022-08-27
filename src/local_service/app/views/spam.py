import re
import datetime
import requests
import emoji

BLACKLIST = {
    "last_update": None,
    "domains": None
}


def get_payload(msg):
    if msg.is_multipart():
        return "".join(map(get_payload, msg.get_payload()))
    return msg.get_payload()


def is_spam(msg):
    return feature1(msg) or feature2(msg) or feature3(msg)


def feature1(msg):
    """
    sent by xxx123@gmail.com, subject starting with green heart, content contains url http://randomurl.xyz
    """
    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]+@gmail.com(>?)$"
    TO_PATTERN = "^undisclosed-recipients:;$"
    BAD_WEBSITE_PATTERN = "https?://.+\\.xyz"
    FAKE_UNSUBSCRIBE_PATTERN = "Click Here To Unsubscribe.{,10}https://docs.google.com/forms/d/"
    FAKE_UNSUBSCRIBE_PATTERN2 = "unsubsribe"
    payload = get_payload(msg)
    return bool(
        re.search(FROM_PATTERN, msg.get("from", "")) and
        re.search(TO_PATTERN, msg.get("to", "")) and
        len(msg["subject"]) > 3 and
        # msg["subject"][0] in emoji.UNICODE_EMOJI_ENGLISH and
        # msg["subject"][1] == ' ' and
        (
            re.search(BAD_WEBSITE_PATTERN, payload) or
            re.search(FAKE_UNSUBSCRIBE_PATTERN, payload, flags=re.IGNORECASE | re.DOTALL) or
            re.search(FAKE_UNSUBSCRIBE_PATTERN2, payload, flags=re.IGNORECASE)
        )
    )

def feature2(msg):
    """
    sent from .xyz or .click domain
    """
    FROM_PATTERN = "\.(xyz|click)$"
    return bool(re.search(FROM_PATTERN, msg.get("from", "")))

def feature3(msg):
    """
    content contains url from http://www.joewein.net/dl/bl/dom-bl.txt
    """
    TO_PATTERN = "^undisclosed-recipients:;$"
    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]+@gmail.com(>?)$"
    if not re.search(TO_PATTERN, msg.get("to", "")) and not re.search(FROM_PATTERN, msg.get("from", "")):
        return False

    def fetch_blacklist():
        SOURCES = [
            "http://www.joewein.net/dl/bl/dom-bl.txt",
            "https://badmojr.github.io/1Hosts/Pro/domains.txt"
        ]
        domains = set()
        for source in SOURCES:
            resp = requests.get(source)
            if resp.ok:
                for line in resp.iter_lines():
                    if line and not line.startswith(b"#"):
                        domain = line.decode('ascii')
                        if (domain.startswith("http://")):
                            domain = domain[len("http://"):]
                        if (domain.startswith("https://")):
                            domain = domain[len("https://"):]
                        domains.add(f"http://{domain}")
                        domains.add(f"https://{domain}")
        BLACKLIST["domains"] = list(domains)

    def lazy_load_blacklist():
        if BLACKLIST["last_update"] != datetime.date.today():
            fetch_blacklist()
            BLACKLIST["last_update"] = datetime.date.today()
        return BLACKLIST["domains"]

    payload = get_payload(msg)
    return any(domain in payload for domain in lazy_load_blacklist())
