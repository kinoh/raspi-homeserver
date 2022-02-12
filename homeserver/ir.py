# http://abyz.me.uk/rpi/pigpio/code/irrp_py.zip

import time
import json
import os
import sys

import pigpio

GPIO = 22
FREQ = 38.0

def carrier(gpio, frequency, micros):
	"""
	Generate carrier square wave.
	"""
	wf = []
	cycle = 1000.0 / frequency
	cycles = int(round(micros/cycle))
	on = int(round(cycle / 2.0))
	sofar = 0
	for c in range(cycles):
		target = int(round((c+1)*cycle))
		sofar += on
		off = target - sofar
		sofar += off
		wf.append(pigpio.pulse(1<<gpio, 0, on))
		wf.append(pigpio.pulse(0, 1<<gpio, off))
	return wf

def playback(code):
	pi = pigpio.pi() # Connect to Pi.

	total = 0
	for s in code:
		total += s
	print(f'total: {total}us')

	pi.set_mode(GPIO, pigpio.OUTPUT) # IR TX connected to this GPIO.

	pi.wave_add_new()

	# Create wave

	emit_time = time.time()

	marks_wid = {}
	spaces_wid = {}

	wave = [0]*len(code)

	for i in range(0, len(code)):
		ci = code[i]
		if i & 1: # Space
			if ci not in spaces_wid:
				pi.wave_add_generic([pigpio.pulse(0, 0, ci)])
				spaces_wid[ci] = pi.wave_create()
			wave[i] = spaces_wid[ci]
		else: # Mark
			if ci not in marks_wid:
				wf = carrier(GPIO, FREQ, ci)
				pi.wave_add_generic(wf)
				marks_wid[ci] = pi.wave_create()
			wave[i] = marks_wid[ci]

	delay = emit_time - time.time()

	if delay > 0.0:
		time.sleep(delay)

	print('sending...')
	real = 0

	pi.wave_chain(wave)

	while pi.wave_tx_busy():
		time.sleep(0.002)
		real += 0.002

	print(f'finished in {real:.3}s')

	for i in marks_wid:
		pi.wave_delete(marks_wid[i])

	marks_wid = {}

	for i in spaces_wid:
		pi.wave_delete(spaces_wid[i])

	spaces_wid = {}

	pi.stop() # Disconnect from Pi.
