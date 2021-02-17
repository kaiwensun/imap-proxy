import os

from flask import Flask

from app.views.imap import bp as imap_bp
# from app.views.control.views import bp as control_bp
# from app.views.modals.views import bp as modals_bp
# from app.views.membership.views import bp as membership_bp
# from app.views.match.views import bp as match_bp

from config import settings


# os.environ['FLASK_ENV'] = settings.ENV

app = Flask(__name__)
# app.config['DEBUG'] = settings.DEBUG_MODE
# app.config['SECRET_KEY'] = settings.FLASK_APP_SECRET_KEY

# Blueprints
app.register_blueprint(imap_bp, url_prefix='/imap')
# app.register_blueprint(modals_bp, url_prefix='/modals')
# app.register_blueprint(membership_bp, url_prefix='/membership')
# app.register_blueprint(match_bp, url_prefix='/match')
