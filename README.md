
    f = lambda x: (17*x**4-114*x**3+163*x**2+90*x+792)/12
    print ''.join(map(chr, map(f, range(5))))

digulator
=========

Digging costs time
Get to the end of the level
When you dig, it replaces the block behind you with sand

Goal is to collect X amount of cash
Monster can eat gold/diamond
Diamond blocks take longer to dig, but earn more cash

Limited sight
Can see gold/diamond everywhere though


What we need
============
	procedural level generator
	ai monster
	webgl scene setup
	player controller

	block textures
	digger model
	alien model



Blocks cost time:
	Sand - yellow
		1
	Dirt - light brown
		2
	Clay - dark brown
		3
	Rock - grey
		4
	Gold - gold
		2
	Diamond - light blue
		4
	Empty - none
		0
	oil - black
		1

	Monster - green
	Fuel??



Sound FX
========

 -drilling
 	-different material sounds
 -gold
 -diamond
 -monster
 -death
 -music



Art
===
	-drill model
	-block textures
	-monster
	

Where to go from here
=====================
	Models for alien and digger
	limited field of view
	laser effect
	more sound effects
	music
	border texture
	HUD (html/css is easiest)
	menu to decide which difficulty
	win condition and screen
	lose condition and screen