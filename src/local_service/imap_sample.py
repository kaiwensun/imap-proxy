from imaplib import IMAP4_SSL
from datetime import datetime
from config.settings import USER_NAME, IMAP_TOKEN, IMAP_ADDRESS, APP_NAME, APP_VERSION

import email
import codecs


def main():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        imap.noop()
        imap.xatom(f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")')
        imap.login(USER_NAME, IMAP_TOKEN)
        emails = []
        for folder in imap.list()[1]:
            if folder.startswith(b'() "/" "'):
                byte_folder_name = folder[8:-1]
                print(byte_folder_name)
                folder_name = decode_folder_name(byte_folder_name)
                print(folder_name)
                print(byte_folder_name.decode("ascii"))
                res = imap.select(
                    f'"{byte_folder_name.decode("ascii")}"', readonly=True)
                print(res)
                if (res[0] != 'OK'):
                    raise Exception()
                print("fetching unread emails")
                mail_ids = imap.search(None, 'UnSeen')[1][0]
                folder_emails = fetch_emails(imap, mail_ids)
                for email in folder_emails:
                    email["folder"] = folder_name
                    email["utf7-folder"] = byte_folder_name.decode("ascii")
                emails += folder_emails
                print("====")
        print("done!")
        print(f"Total unread: {len(emails)}")
        print(emails)


def fetch_emails(imap, mail_ids):
    res = []
    if isinstance(mail_ids, bytes):
        mail_ids = mail_ids.decode('ascii')
    if isinstance(mail_ids, str):
        mail_ids = mail_ids.split()

    for mail_id in mail_ids:
        data = imap.fetch(mail_id, "(RFC822)")[1]
        print("=" * 40)
        print(mail_id)
        for response_part in data:
            if isinstance(response_part, tuple):
                msg = email.message_from_string(
                    response_part[1].decode('utf-8'))
                subject = parse_header(msg["Subject"])
                sender = email.utils.parseaddr(parse_header(msg["FROM"]))
                receiver = email.utils.parseaddr(parse_header(msg["TO"]))
                date = email.utils.parsedate_to_datetime(msg["Date"])
                timestamp = int(datetime.timestamp(date))
                print(subject)
                res.append({
                    "eid": mail_id,
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


if __name__ == "__main__":
    main()
