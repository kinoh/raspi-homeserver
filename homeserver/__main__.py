import ipaddress
import os
import werkzeug.security
import flask
import flask_httpauth
import dotenv

from .player import MpvPlayer
from .irmanager import IRManager

dotenv.load_dotenv(verbose=True)

player = MpvPlayer()

IR_REPOSITORY_PATH = os.environ.get('IR_REPOSITORY_PATH')
ir = IRManager(IR_REPOSITORY_PATH)

app = flask.Flask(__name__, static_url_path='/', static_folder='web_build')
app.config['JSON_AS_ASCII'] = False
auth = flask_httpauth.HTTPBasicAuth()

@auth.verify_password
def verify_password(username, password):
	if ipaddress.ip_address(flask.request.remote_addr).is_private:
		return f'local:{username}'
	USER_NAME = os.environ.get('USER_NAME')
	USER_PASSWORD = os.environ.get('USER_PASSWORD')
	if username == USER_NAME and werkzeug.security.check_password_hash(USER_PASSWORD, password):
		return username

@app.route('/api/music/status', methods=['GET'])
@auth.login_required
def music_status():
	result = player.status()
	return flask.jsonify(result)

@app.route('/api/music/play', methods=['POST'])
def music_play():
	player.play(flask.request.json['url'])
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/pause', methods=['POST'])
@auth.login_required
def music_pause():
	result = player.pause()
	return flask.jsonify({ 'ok': True, 'paused': result })

@app.route('/api/music/stop', methods=['POST'])
@auth.login_required
def music_stop():
	player.stop()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/prev', methods=['POST'])
@auth.login_required
def music_prev():
	player.prev()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/next', methods=['POST'])
@auth.login_required
def music_next():
	player.next()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/shuffle', methods=['POST'])
@auth.login_required
def music_shuffle():
	player.shuffle()
	return flask.jsonify({ 'ok': True })

@app.route('/api/music/volume', methods=['POST'])
@auth.login_required
def music_volume():
	player.set_volume(flask.request.json['volume'])
	return flask.jsonify({ 'ok': True })

@app.route('/api/ir/status', methods=['GET'])
@auth.login_required
def ir_status():
	result = ir.status()
	return flask.jsonify(result)

@app.route('/api/ir/status', methods=['POST'])
@auth.login_required
def ir_status_post():
	new_status = ir.status()
	new_status.update(flask.request.json)
	ir.update(new_status)
	result = ir.status()
	return flask.jsonify(result)

@app.route('/', defaults={'path': ''})
@app.route('/<path>')
@auth.login_required
def catch_all(path):
	if '.' in path:
		return app.send_static_file(path)
	return app.send_static_file('index.html')

if __name__ == '__main__':
	HOST = os.environ.get('HOST')
	PORT = int(os.environ.get('PORT'))
	SSL_CERT = os.environ.get('SSL_CERT')
	SSL_KEY = os.environ.get('SSL_KEY')
	app.run(host=HOST, port=PORT, ssl_context=(SSL_CERT, SSL_KEY), threaded=True, debug=True)
