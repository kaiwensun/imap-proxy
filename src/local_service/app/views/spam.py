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
    return feature1(msg) or feature2(msg)


def feature1(msg):
    """
    sent by xxx123@gmail.com, subject starting with green heart, content contains url http://randomurl.xyz
    """
    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]+@gmail.com(>?)$"
    TO_PATTERN = "^undisclosed-recipients:;$"
    CONTENT_PATTERN = "http://.+\\.xyz"
    return bool(
        re.search(FROM_PATTERN, msg["from"]) and
        re.search(TO_PATTERN, msg["to"]) and
        len(msg["subject"]) > 3 and
        # msg["subject"][0] in emoji.UNICODE_EMOJI_ENGLISH and
        # msg["subject"][1] == ' ' and
        re.search(CONTENT_PATTERN, get_payload(msg)))


def feature2(msg):
    """
    content contains url from http://www.joewein.net/dl/bl/dom-bl.txt
    """
    TO_PATTERN = "^undisclosed-recipients:;$"
    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]+@gmail.com(>?)$"
    if not re.search(TO_PATTERN, msg["to"]) and not re.search(FROM_PATTERN, msg["from"]):
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
