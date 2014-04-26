var Digulator = {};

var THREE = require('three/three');
window.THREE = THREE;

var scene = new THREE.Scene();
window.scene = scene;
var camera = new THREE.OrthographicCamera(-0.5, 9.5, -0.5, 9.5, 0, 10);

var Keyboard = require('./objects/keyboard');

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);

var World = require('./objects/world');
var Particles = require('./objects/particles');
var GameState = require('./objects/gamestate');

var world = new World();
console.log('created a world!');

var particles = new Particles();
camera.position.z = 5;

Game = function()
{
	GameState.call(this);
	
	this.enter = function()
	{
		// cube = new Digulator.Sand();
		// scene.add(cube);

		world.createWorld();
	}
	this.update = function(dt)
	{
		cube.rotation.x += dt;
		cube.rotation.y += dt;
	}
	this.display = function()
	{
		renderer.render(scene, camera);
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
var mainloop = function()
{
	var thisTime = new Date().getTime();
	var frameTime = thisTime - lastTime;
	lastTime = thisTime;
	var sleepTime = Math.max(0.0, frameTime - targetFrametime);
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
}

var keys = new Keyboard();

keys.onleft = function () {
  console.log('LEFT!!!');
};
keys.onright = function () {
  console.log('RIGHT!!!');

};
keys.onup = function () {
  console.log('UP!!!');
};
keys.ondown = function () {
  console.log('DOWN!!!');
};

window.onload = function()
{

	changeGameState(new Game());
	mainloop();
}