from flask import Flask

app = Flask(__name__, static_url_path="/static", static_folder='static/')

import TSEGroup8Website.data
import TSEGroup8Website.api
import TSEGroup8Website.views