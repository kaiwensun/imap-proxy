import sys
import re
import datetime
import requests
import collections

from config.settings import USER_NAME

BLACKLIST = {
    "last_update": None,
    "domains": None
}


def get_payload(msg, include_attachment=False):
    if msg.is_multipart():
        return "".join(
            map(lambda payload: get_payload(payload, include_attachment),
                filter(lambda payload: include_attachment or not payload.is_attachment(), msg.get_payload())
            )
        )
    return msg.get_payload()


def is_spam(msg):
    module = sys.modules[__name__]
    func_names = [name for name in dir(module) if name.startswith('feature')]
    return any(getattr(module, name)(msg) for name in func_names)


def short_text_with_long_attachment(msg, payload_text):
    if len(payload_text) > 80:
        return False
    attachment_size = sum(len(get_payload(att, include_attachment=True)) for att in msg.iter_attachments())
    if attachment_size < 1000000:
        return False
    return True

def feature1(msg):
    """
    sent by xxx123@gmail.com, subject starting with green heart, content contains url http://randomurl.xyz
    """

    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]*@gmail.com(>?)$"
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
            re.search(FAKE_UNSUBSCRIBE_PATTERN2, payload, flags=re.IGNORECASE) or
            short_text_with_long_attachment(msg, payload)
        )
    )


def feature2(msg):
    """
    sent from .xyz or .click domain
    """
    FROM_PATTERN = "\.(xyz|click|lol|quest)(>?)$"
    return bool(re.search(FROM_PATTERN, msg.get("from", "")))

def feature3(msg):
    payload = get_payload(msg)
    PATTERN1 = '<span style="font-size: 18pt; font-family: Arial; color: rgb(17, 85, 204); '
    PATTERN2 = 'font-variant-numeric: normal; font-variant-east-asian: normal; text-decoration-line: underline; text-decoration-skip-ink: none; vertical-align: baseline; white-space: pre-wrap;">'
    return PATTERN1 in payload and PATTERN2 in payload

def feature4(msg):
    FROM_PATTERN = " <.+@[-\\w]+\.info>$"
    SENDER_PATTERN = f"-{USER_NAME.replace('@', '=')}@[-\\w]+\\.info$"
    return bool(re.search(SENDER_PATTERN, msg.get("sender", ""))
        and re.search(FROM_PATTERN, msg.get("from", "")))

def feature5(msg):
    """
    content contains url from http://www.joewein.net/dl/bl/dom-bl.txt
    """
    TO_PATTERN = "^undisclosed-recipients:;$"
    FROM_PATTERN = "^(.*<)?[a-z]+\.?[0-9]+@gmail.com(>?)$"
    if not re.search(TO_PATTERN, msg.get("to", "")) and not re.search(FROM_PATTERN, msg.get("from", "")):
        return False

    def put_to_trie(trie, word):
        p = trie
        for c in word:
            p = p[c]
        p[''] = True

    def is_in_trie(trie, word, i):
        """
        retrun true if a prefix of word[i:] is in the trie
        """
        p = trie
        while i < len(word):
            if word[i] in p:
                p = p[word[i]]
                if '' in p:
                    return p['']
                i += 1
            else:
                break
        return False

    def fetch_blacklist():
        SOURCES = [
            "http://www.joewein.net/dl/bl/dom-bl.txt",
            "https://badmojr.github.io/1Hosts/Pro/domains.txt"
        ]
        Trie = lambda: collections.defaultdict(Trie)
        domains = Trie()

        for source in SOURCES:
            resp = requests.get(source)
            if resp.ok:
                for line in resp.iter_lines():
                    if line and not line.startswith(b"#"):
                        domain = line.decode('ascii')
                        for protocol in ["http://", "https://"]:
                            if (domain.startswith(protocol)):
                                domain = domain[len(protocol):]
                                break
                        put_to_trie(domains, f"://{domain}")
        BLACKLIST["domains"] = list(domains)

    def lazy_load_blacklist():
        if BLACKLIST["last_update"] != datetime.date.today():
            fetch_blacklist()
            BLACKLIST["last_update"] = datetime.date.today()
        return BLACKLIST["domains"]

    payload = get_payload(msg)
    blacklist = lazy_load_blacklist()
    for i in range(len(payload)):
        if is_in_trie(blacklist, payload, i):
            return True
    return False
