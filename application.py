from flask import Flask, Blueprint, render_template
app = Flask(__name__, template_folder='./', static_folder='./src')

blueprint = Blueprint('site', __name__, static_folder='./assets')
app.register_blueprint(blueprint)


@app.route("/")
def hello():
    return render_template('index.html')
