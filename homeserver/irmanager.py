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
		mode_dict = {
			MP501.MODE_COOLER: 'cooler',
			MP501.MODE_HEATER: 'heater',
			MP501.MODE_DEHUMIDIFIER: 'dehumidifier',
		}
		return {
			'power_on': self.model.power == MP501.POWER_ON,
			'mode': mode_dict[self.model.mode],
			'temperature': self.model.temperature,
			'dehumidifier_level': 2 - self.model.dehumidifier_level,
			'output': self.model.output,
			'direction': self.model.direction,
		}

	def send(self):
		playback(self.model.generate_code())
		self._save()

	def update(self, status) -> None:
		mode_dict = {
			'cooler': MP501.MODE_COOLER,
			'heater': MP501.MODE_HEATER,
			'dehumidifier': MP501.MODE_DEHUMIDIFIER,
		}
		self.model.power = MP501.POWER_ON if status['power_on'] else MP501.POWER_OFF
		self.model.mode = mode_dict[status['mode']]
		self.model.temperature = status['temperature']
		self.model.dehumidifier_level = 2 - status['dehumidifier_level']
		self.model.output = status['output']
		self.model.direction = status['direction']
		self.send()
