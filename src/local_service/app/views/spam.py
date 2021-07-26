import re


def get_payload(msg):
    if msg.is_multipart():
        return "".join(map(get_payload, msg.get_payload()))
    return msg.get_payload()


def is_spam(msg):
    return feature1(msg)


def feature1(msg):
    """
    sent by xxx123@gmail.com, subject starting with green heart, content contains url http://randomurl.xyz
    """
    FROM_PATTERN = "^[a-z]+[0-9]+@gmail.com$"
    TO_PATTERN = "^undisclosed-recipients:;$"
    SUBJECT_PATTERN = "^(💚|💎)"
    CONTENT_PATTERN = "http://.+\\.xyz"
    return bool(
        re.search(FROM_PATTERN, msg["from"]) and
        re.search(TO_PATTERN, msg["to"]) and
        re.search(SUBJECT_PATTERN, msg["subject"]) and
        re.search(CONTENT_PATTERN, get_payload(msg)))
