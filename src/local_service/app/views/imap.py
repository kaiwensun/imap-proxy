import email
import codecs
from config.settings import USER_NAME, IMAP_TOKEN, IMAP_ADDRESS, APP_NAME, APP_VERSION
from imaplib import IMAP4_SSL
from flask import Blueprint


bp = Blueprint(__name__.split('.')[-1], __name__)


@bp.route('unread_email_ids', methods=['GET'])
def count_unread():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        imap.xatom(f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")')
        imap.login(USER_NAME, IMAP_TOKEN)
        imap.select(readonly=True)
        _, email_ids = imap.search(None, 'UnSeen')
        email_ids = email_ids[0].decode('utf-8').split()
        res = []
        for folder in imap.list()[1]:
            if folder.startswith(b'() "/" "'):
                folder = folder[8:-1]
                decoded = decode_folder_name(folder)
                print(decoded)
                imap.select(mailbox=b'"' + folder + b'"', readonly=True)
                _, email_ids = imap.search(None, 'UnSeen')
                email_ids = email_ids[0].decode('utf-8').split()
                res.extend([{
                    "folder": decoded,
                    "id": email_id
                } for email_id in email_ids])
        print(res)
        return {
            "count": len(res),
            "emails": res
        }


def decode_folder_name(name):
    return codecs.decode(name.replace(b"&", b"+"), encoding='utf-7')


def encode_folder_name(name):
    return codecs.encode(name, encoding='utf-7').replace(b"+", b"&")


def list_folders():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        imap.xatom(f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")')
        imap.login(USER_NAME, IMAP_TOKEN)
        folders = [decode_folder_name(folder) for folder in imap.list()[1]]
        folders = [
            folder for folder in folders if folder.startswith('() "/" "')]
