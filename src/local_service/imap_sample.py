from imaplib import IMAP4_SSL
from config.settings import USER_NAME, IMAP_TOKEN, IMAP_ADDRESS, APP_NAME, APP_VERSION

import email, codecs


def main():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        imap.noop()
        imap.xatom(f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")')
        imap.login(USER_NAME, IMAP_TOKEN)
        for folder in imap.list()[1]:
            if folder.startswith(b'() "/" "'):
                print(folder)
                folder = decode_folder_name(folder)[8:-1]
                print(folder)
                print(encode_folder_name(folder))
                imap.select(f'"{encode_folder_name(folder)}"')
                print("====")
        print("done!")
        imap.select(readonly=True)
        _, mail_ids = imap.search(None, 'UnSeen')
        mail_ids = mail_ids[0].split()
        print(f"Total unread: {len(mail_ids)}")

        for mail_id in mail_ids:
            data = imap.fetch(mail_id, "(RFC822)")[1]
            print("=" * 40)
            print(mail_id)
            for response_part in data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_string(
                        response_part[1].decode('utf-8'))
                    print(parse_subject(msg))


def decode_folder_name(name):
    return codecs.decode(name.replace(b"&", b"+"), encoding='utf-7')


def encode_folder_name(name):
    return codecs.encode(name, encoding='utf-7').replace(b"+", b"&")


def parse_subject(msg):
    res = []
    for text, code in email.header.decode_header(msg["Subject"]):
        if code is not None:
            text = text.decode(code)
        res.append(text)
    return "".join(res)


if __name__ == "__main__":
    main()
