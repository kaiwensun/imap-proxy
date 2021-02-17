import email
from config.settings import USER_NAME, IMAP_TOKEN, IMAP_ADDRESS, APP_NAME, APP_VERSION
from imaplib import IMAP4_SSL
from flask import Blueprint


bp = Blueprint(__name__.split('.')[-1], __name__)


@bp.route('unread_email_ids', methods=['GET'])
def count_unread():
    with IMAP4_SSL(IMAP_ADDRESS) as imap:
        imap.noop()
        imap.xatom(f'ID ("name" "{APP_NAME}" "version" "{APP_VERSION}")')
        imap.login(USER_NAME, IMAP_TOKEN)
        imap.select(readonly=True)
        _, email_ids = imap.search(None, 'UnSeen')
        email_ids = email_ids[0].decode('utf-8').split()
        return {
            "count": len(email_ids),
            "email_ids": email_ids
        }
