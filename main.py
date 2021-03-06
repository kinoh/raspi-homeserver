import flask
import datetime
import dotenv
import mpv
import os

dotenv.load_dotenv(verbose=True)

class MpvPlayer():
	def __init__(self):
		self.mpv = mpv.MPV(video=False, ytdl=True)

	def play(self, url):
		self.mpv.play(url)

	def pause(self):
		value = not self.mpv.pause
		self.mpv.pause = value
		return value

	def stop(self):
		self.mpv.stop()

	def prev(self):
		self.mpv.playlist_prev()

	def next(self):
		self.mpv.playlist_next()

	def shuffle(self):
		self.mpv.playlist_shuffle()

	def set_volume(self, value):
		ranged = max(0, min(100, value))
		self.mpv.volume = ranged
		return ranged

	def status(self):
		return {
			'title': self.mpv.media_title,
			'path': self.mpv.path,
			'duration': self.mpv.duration,
			'codec': self.mpv.audio_codec,
			'audio_params': self.mpv.audio_params,
			'volume': self.mpv.volume,
			't': self.mpv.time_pos,
			'paused': self.mpv.pause,
			'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
		}

player = MpvPlayer()

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

if __name__ == '__main__':
	SSL_CERT = os.environ.get('SSL_CERT')
	SSL_KEY = os.environ.get('SSL_KEY')
	app.run(host='0.0.0.0', port=443, ssl_context=(SSL_CERT, SSL_KEY), threaded=True, debug=True)
