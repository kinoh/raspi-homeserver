import datetime
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
