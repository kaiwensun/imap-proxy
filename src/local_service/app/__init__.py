import os

from flask import Flask

from app.views.imap import bp as imap_bp

from config import settings

app = Flask(__name__)

app.register_blueprint(imap_bp, url_prefix='/imap')
