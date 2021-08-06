import re
import emoji


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
    SUBJECT_PATTERN = ("^["
                       u"\U0001F600-\U0001F64F"  # emoticons
                       u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                       u"\U0001F680-\U0001F6FF"  # transport & map symbols
                       u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                       "]" )
    CONTENT_PATTERN = "http://.+\\.xyz"
    return bool(
        re.search(FROM_PATTERN, msg["from"]) and
        re.search(TO_PATTERN, msg["to"]) and
        len(msg["subject"]) > 3 and
        msg["subject"][0] in emoji.UNICODE_EMOJI_ENGLISH and
        msg["subject"][1] == ' ' and
        re.search(CONTENT_PATTERN, get_payload(msg)))
