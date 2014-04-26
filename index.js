var Digulator = {};

var THREE = require('three/three');
window.THREE = THREE;

var scene = new THREE.Scene();
window.scene = scene;
var light = new THREE.PointLight(0xFFFFFF);
light.position.z = 3;
light.position.x = 4.5;
light.position.y = 4.5;
scene.add(light);

function AssertException(message)
{
	this.message = message;
}
AssertException.prototype.toString = function () {
	return 'AssertException: ' + this.message;
}
function assert(exp, message) {
	if (!exp)
		throw new AssertException(message);
}
window.assert = assert;

var Keyboard = require('./objects/keyboard');
var Player = require('./objects/player');
var World = require('./objects/world');
var Particles = require('./objects/particles');
var GameState = require('./objects/gamestate');
var Bloom = require('./objects/bloom');

var renderer = new THREE.WebGLRenderer();
gl = renderer.context;

var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
document.body.appendChild(stats.domElement);

var width = window.innerWidth;
var height = window.innerHeight;
if(width > height){
	height -= 100;
	width =  height;
}
else{
	width -= 100;
	height = width;
}
var camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 20 );

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var SoundPlayer = require('./objects/soundPlayer');
var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshLambertMaterial({color: 0xAAAAAA});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.x = 4.5;
cube.position.y = 4.5;
cube.position.z = 1;

var world = new World();
console.log('created a world!');

var soundPlayer = new SoundPlayer();

camera.position.z = 15;
var cameraFocus = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

function shake(x)
{
	var r = 0.0;
	for (var i = 0; i < 6; ++i)
	{
		var f = (1 << i);
		r += Math.sin(x * f) / f;
	}
	return r;
}
var screenShake = 0.0;
var screenShakeTime = 0.0;

Game = function()
{
	GameState.call(this);

	this.bloom = new Bloom(width, height);
	this.particles = new Particles();
	
	this.enter = function()
	{
		// cube = new Digulator.Sand();
		// scene.add(cube);

		world.createWorld();
	}
	this.fixedUpdate = function(dt)
	{
		var playerpos = player.object.position;
		var targetX = Math.max(-5, Math.min(5, playerpos.x - 5)) + 5;
		var targetY = Math.max(-5, Math.min(5, playerpos.y - 5)) + 5;
		cameraFocus.x += (targetX - cameraFocus.x) * 0.04;
		cameraFocus.y += (targetY - cameraFocus.y) * 0.04;
	
		screenShakeTime += dt;	
		camera.position.x = cameraFocus.x + shake(100.0 * screenShakeTime) * Math.sqrt(screenShake) * 0.1;
		camera.position.y = cameraFocus.y + shake(100.0 * screenShakeTime + 12383.23487) * Math.sqrt(screenShake) * 0.1;
		screenShake *= 0.9;
	}

	this.secondTimer = 0.0;
	this.fixedUpdateTime = 1.0/120.0;
	this.fixedUpdateTimer = 0.0;
	this.update = function(dt)
	{
		//loop until processed all fixed updates
		this.fixedUpdateTimer += dt;
		while (this.fixedUpdateTimer > this.fixedUpdateTime)
		{
			this.fixedUpdateTimer -= this.fixedUpdateTime;
			this.fixedUpdate(this.fixedUpdateTime);
		}
		
		//poll stuff once a second
		this.secondTimer += dt;
		if (this.secondTimer > 1.0)
		{
			this.secondTimer = 0.0;
			//screenShake += 4.0;
		}
	
		cube.rotation.x += dt;
		cube.rotation.y += dt;
		
		// soundPlayer.play('test');
	}
	this.display = function()
	{
		this.bloom.bind();
		renderer.render(scene, camera);
		this.bloom.unbind();
	}
}

var currentGameState = null;

var changeGameState = function(newState)
{
	if (currentGameState)
		currentGameState.leave();
	
	newState.enter();
	
	currentGameState = newState;
}

var lastTime = 0.0;
var sleepTime = 0.0;
var targetFrametime = 1000.0/60.0;
var javascriptUsage = 0.0;
var sleepTime = 0.0;
var mainloop = function()
{
	stats.begin();
	var thisTime = new Date().getTime();
	var frameTime = thisTime - lastTime;
	lastTime = thisTime;
	sleepTime += targetFrametime - frameTime;
	sleepTime = Math.max(Math.min(sleepTime, targetFrametime), 0);
	javascriptUsage = 1.0 - sleepTime / targetFrametime;
	var dt = frameTime * 0.001;
	
	//if the browser pauses the script or is running slow limit the frame time
	if (dt > 4.0)
		dt = 0.0;
	if (dt > 0.5)
		dt = 0.5;
	
	currentGameState.update(dt);
	
	currentGameState.display();
	
	window.setTimeout(mainloop, sleepTime);
	stats.end();
}

var keys = new Keyboard();

var player = new Player({
  world: world
});

keys.onleft = function () {
  player.left();
};
keys.onright = function () {
  player.right();
};
keys.onup = function () {
  screenShake += 1.0;
};
keys.ondown = function () {
  player.digDown();
};

window.onload = function()
{

	changeGameState(new Game());
	mainloop();
}
