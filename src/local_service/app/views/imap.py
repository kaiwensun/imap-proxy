import email
import codecs
from config.settings import USER_NAME, IMAP_TOKEN, IMAP_ADDRESS, APP_NAME, APP_VERSION
from imaplib import IMAP4_SSL
from flask import Blueprint
from datetime import datetime


bp = Blueprint(__name__.split('.')[-1], __name__)


@bp.route('unread_email_ids', methods=['GET'])
def count_unread():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        validate_resp(imap.xatom(
            f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")'))
        validate_resp(imap.login(USER_NAME, IMAP_TOKEN))
        emails = []
        for folder in imap.list()[1]:
            if folder.startswith(b'() "/" "'):
                byte_folder_name = folder[8:-1]
                folder_name = decode_folder_name(byte_folder_name)
                validate_resp(imap.select(
                    f'"{byte_folder_name.decode("ascii")}"', readonly=True))
                email_ids = validate_resp(imap.search(None, 'UnSeen'))[0]
                folder_emails = fetch_emails(imap, email_ids)
                for email in folder_emails:
                    email["folder"] = folder_name
                    email["utf7-folder"] = byte_folder_name.decode("ascii")
                emails.extend(folder_emails)
        print(emails)
        return {
            "count": len(emails),
            "emails": emails
        }


def fetch_emails(imap, email_ids):
    res = []
    if isinstance(email_ids, bytes):
        email_ids = email_ids.decode('ascii')
    if isinstance(email_ids, str):
        email_ids = email_ids.split()

    for email_id in email_ids:
        data = imap.fetch(email_id, "(RFC822)")[1]
        print("=" * 40)
        print(email_id)
        for response_part in data:
            if isinstance(response_part, tuple):
                msg = email.message_from_string(
                    response_part[1].decode('utf-8'))
                subject = parse_header(msg["Subject"])
                sender = email.utils.parseaddr(parse_header(msg["FROM"]))
                receiver = email.utils.parseaddr(parse_header(msg["TO"]))
                date_str = msg["Date"] or msg["Resent-Date"]
                if not date_str:
                    date_str = msg["Received"].split("\n")[-1].strip()
                try:
                    date = email.utils.parsedate_to_datetime(date_str)
                    timestamp = int(datetime.timestamp(date))
                except TypeError:
                    date = None
                    timestamp = 0
                    print("failed to get date")
                    print(msg.items())
                print(subject)
                res.append({
                    "eid": email_id,
                    "subject": subject,
                    "sender_name": sender[0],
                    "sender_addr": sender[1],
                    "receiver_name": receiver[0],
                    "receiver_addr": receiver[1],
                    "timestamp": timestamp
                })
    return res


def decode_folder_name(name):
    return codecs.decode(name.replace(b"&", b"+"), encoding='utf-7')


def encode_folder_name(name):
    # this method doesn't always work
    return codecs.encode(
        name, encoding='utf-7').decode("ascii").replace("+", "&").replace("&-", "+-")


def parse_header(line):
    res = []
    for text, code in email.header.decode_header(line):
        if code is not None:
            text = text.decode(code)
        elif isinstance(text, bytes):
            text = text.decode("ascii")
        res.append(text)
    return "".join(res)


def validate_resp(imap_res, message=None):
    if imap_res[0] != "OK":
        raise UnhealthyImapResponse(imap_res[0], imap_res[1], message)
    return imap_res[1]


class UnhealthyImapResponse(Exception):
    def __init__(self, resp, data, message=None):
        self.resp = resp
        self.data = data
        self.message = "unhealthy imap response" if message is None else message
        supper().__init__(f"{resp} - {message}")
