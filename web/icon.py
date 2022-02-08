import math

size = 100

def to_svg(tag, points):
	list = ' '.join([f'{v:0.2f}' for v in points])
	return f'  <{tag} points="{list}" stroke="black" fill="transparent" stroke-width="4"/>'

def polygon(n, scale, phase):
	vertices = []
	for i in range(0, n):
		t = -math.pi * 2 / n * i + phase
		vertices.append(size * (0.5 + scale * 0.5 * math.cos(t)))
		vertices.append(size * (0.5 - scale * 0.5 * math.sin(t)))

	print(to_svg('polygon', vertices))

def edge(n, scale1, scale2, phase):
	for i in range(0, n):
		vertices = []
		t = -math.pi * 2 / n * i + phase
		for s in [scale1, scale2]:
			vertices.append(size * (0.5 + s * 0.5 * math.cos(t)))
			vertices.append(size * (0.5 - s * 0.5 * math.sin(t)))
		print(to_svg('polyline', vertices))

polygon(10, 0.95, -math.pi / 2)
polygon(5, 0.65, math.pi / 2)
edge(5, 0.65, 0.95, math.pi / 2)
