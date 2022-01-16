import flask
import mpv

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

	def status(self):
		return {
			'title': self.mpv.media_title,
			'path': self.mpv.path,
			'duration': self.mpv.duration,
			'codec': self.mpv.audio_codec,
			'audio_params': self.mpv.audio_params,
			't': self.mpv.time_pos,
			'paused': self.mpv.pause,
		}

player = MpvPlayer()

app = flask.Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route('/')
def hello():
	return 'hello!'

@app.route('/music/status', methods=['GET'])
def music_status():
	result = player.status()
	return flask.jsonify(result)

@app.route('/music/play', methods=['POST'])
def music_play():
	player.play(flask.request.json['url'])
	return flask.jsonify({ 'ok': True })

@app.route('/music/pause', methods=['POST'])
def music_pause():
	result = player.pause()
	return flask.jsonify({ 'paused': result })

@app.route('/music/stop', methods=['POST'])
def music_stop():
	player.stop()
	return flask.jsonify({ 'ok': True })
