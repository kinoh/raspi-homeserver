import json
import os
import time

from .ir import playback
from .mitsubishi import MP501, MP501Encoder, MP501Decoder

class IRManager():
	def __init__(self, repository_path: str) -> None:
		self.repository = repository_path
		if os.path.isfile(self.repository):
			self._load()
		else:
			self.model = MP501(
				MP501.POWER_ON,
				MP501.MODE_HEATER,
				19,
				MP501.DEHUMIDIFIER_LEVEL_STRONG,
				MP501.OUTPUT_AUTO,
				MP501.DIRECTION_4
			)

	def _save(self):
		data = json.dumps(self.model, cls=MP501Encoder)
		with open(self.repository, 'w') as f:
			f.write(data)

	def _load(self):
		with open(self.repository) as f:
			data = f.read()
		self.model = json.loads(data, cls=MP501Decoder)

	def status(self):
		return self.model.__dict__

	def send(self):
		playback(self.model.generate_code())
		self._save()

	def change_power(self, on: bool) -> None:
		self.model.power = MP501.POWER_ON if on else MP501.POWER_OFF
		self.send()

	def change_temperature(self, value: int) -> None:
		self.model.temperature = value
		self.send()
