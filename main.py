from quart import Quart, render_template, jsonify
from blueprints.api import api

app = Quart(__name__)
app.register_blueprint(api)


@app.route('/')
async def index():
    return await render_template('index.html')

if __name__ == "__main__":
    app.run(port=80, host='0.0.0.0')
