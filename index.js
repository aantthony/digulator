var Digulator = {};

var THREE = require('three/three');
window.THREE = THREE;

var scene = new THREE.Scene();
window.scene = scene;
var camera = new THREE.OrthographicCamera(-0.5, 9.5, -0.5, 9.5, 0, 10);

var Keyboard = require('./objects/keyboard');
var Player = require('./objects/player');

var renderer = new THREE.WebGLRenderer();

var readme = require('./README.md');
console.log(readme);

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

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var World = require('./objects/world');
var Particles = require('./objects/particles');
var GameState = require('./objects/gamestate');

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0xAAAAAA});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.x = 4.5;
cube.position.y = 4.5;
cube.position.z = 1;

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

var player = new Player();

keys.onleft = function () {
  player.left();
};
keys.onright = function () {
  player.right();
};
keys.onup = function () {

};
keys.ondown = function () {
  player.digDown();
};

window.onload = function()
{

	changeGameState(new Game());
	mainloop();
}