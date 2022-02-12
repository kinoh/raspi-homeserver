import flask
import dotenv
import os

from .player import MpvPlayer
from .irmanager import IRManager

dotenv.load_dotenv(verbose=True)

player = MpvPlayer()

IR_REPOSITORY_PATH = os.environ.get('IR_REPOSITORY_PATH')
ir = IRManager(IR_REPOSITORY_PATH)

app = flask.Flask(__name__, static_url_path='/', static_folder='web_build')
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def hello():
	return app.send_static_file('index.html')

@app.route('/api/music/status', methods=['GET'])
def music_status():
	result = player.status()
	return flask.jsonify(result)

@app.route('/api/music/play', methods=['POST'])
def music_play():
	player.play(flask.request.json['url'])
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/pause', methods=['POST'])
def music_pause():
	result = player.pause()
	return flask.jsonify({ 'ok': True, 'paused': result })

@app.route('/api/music/stop', methods=['POST'])
def music_stop():
	player.stop()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/prev', methods=['POST'])
def music_prev():
	player.prev()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/next', methods=['POST'])
def music_next():
	player.next()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/shuffle', methods=['POST'])
def music_shuffle():
	player.shuffle()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/volume', methods=['POST'])
def music_volume():
	player.set_volume(flask.request.json['volume'])
	return flask.jsonify({ 'ok': True })

@app.route('/api/ir/power', methods=['POST'])
def ir_power():
	ir.change_power(flask.request.json['on'])
	return flask.jsonify({ 'ok': True })

@app.route('/api/ir/temperature', methods=['POST'])
def ir_temperature():
	ir.change_temperature(flask.request.json['temperature'])
	return flask.jsonify({ 'ok': True })

if __name__ == '__main__':
	SSL_CERT = os.environ.get('SSL_CERT')
	SSL_KEY = os.environ.get('SSL_KEY')
	app.run(host='0.0.0.0', port=443, ssl_context=(SSL_CERT, SSL_KEY), threaded=True, debug=True)
