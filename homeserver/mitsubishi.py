import json
import math

def segments(l, n):
	result = []
	for i in range(math.ceil(len(l) / n)):
		result.append(l[i*n:(i+1)*n])
	return result

def add_reversed(a, b):
	result = []
	carry = 0
	for i in range(len(a)):
		s = a[i] + b[i] + carry
		if s >= 2:
			carry = 1
			s -= 2
		else:
			carry = 0
		result.append(s)
	return result

def checksum(code):
	data = [0,0,0,0]
	data.extend(code)
	data.extend([0,0,1,0,1,1,1,1])

	sum = [0 for _ in range(8)]
	for s in segments(data, 8):
		sum = add_reversed(sum, s)

	return sum

def encode(digits, value):
	return reversed([int(d) for d in f'{{:0{digits}b}}'.format(value)])

def to_waves(unit_us, code):
	data = []

	data.append(8 * unit_us)
	data.append(4 * unit_us)
	for d in code:
		if d == 1:
			data.append(1 * unit_us)
			data.append(3 * unit_us)
		else:
			data.append(1 * unit_us)
			data.append(1 * unit_us)

	return data

class MP501Encoder(json.JSONEncoder):
	def default(self, o):
		if isinstance(o, MP501):
			return {'_type': 'MP501', '_value': o.__dict__}
		return json.JSONEncoder.default(self, o)

class MP501Decoder(json.JSONDecoder):
	def __init__(self, *args, **kwargs):
		json.JSONDecoder.__init__(self, object_hook=self.object_hook, *args, **kwargs)

	def object_hook(self, o):
		if '_type' in o and o['_type'] == 'MP501':
			return MP501(**o['_value'])
		return o

class MP501:
	POWER_OFF = 0
	POWER_ON = 1
	MODE_HEATER = 1
	MODE_DEHUMIDIFIER = 2
	MODE_COOLER = 3
	DEHUMIDIFIER_LEVEL_STRONG = 0
	DEHUMIDIFIER_LEVEL_NORMAL = 1
	DEHUMIDIFIER_LEVEL_WEAK = 2
	OUTPUT_AUTO = 0
	OUTPUT_1 = 1
	OUTPUT_2 = 2
	OUTPUT_3 = 3
	DIRECTION_AUTO = 0
	DIRECTION_1 = 1
	DIRECTION_2 = 2
	DIRECTION_3 = 3
	DIRECTION_4 = 4
	DIRECTION_SWING = 5

	def __init__(self, power, mode, temperature, dehumidifier_level, output, direction):
		self.power = power
		self.mode = mode
		self.temperature = temperature
		self.dehumidifier_level = dehumidifier_level
		self.output = output
		self.direction = direction

	def generate_code(self, waves=True):
		header = [int(d) for d in '11000100110100110110']

		payload = [int(d) for d in '0100100000000000000000000']
		payload.extend(encode(6, self.power))
		payload.extend(encode(5, self.mode))
		payload.extend(encode(9, self.temperature - 16))
		payload.extend(encode(3, self.dehumidifier_level))
		payload.extend(encode(4, 0b11))
		payload.extend(encode(3, self.output))
		payload.extend(encode(3, self.direction))
		payload.extend(encode(58, 0b1))

		check = checksum(payload)

		code = []
		code.extend(header)
		code.extend(payload)
		code.extend(check)
		code.extend([0])

		if not waves:
			return code

		return to_waves(420, code)
