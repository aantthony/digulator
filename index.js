var Digulator = {};

var THREE = require('three/three');
window.THREE = THREE;

var scene = new THREE.Scene();
window.scene = scene;

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
var Monster = require('./objects/monster');
var World = require('./objects/world');
var Particles = require('./objects/particles');
var GameState = require('./objects/gamestate');
var Bloom = require('./objects/bloom');
var soundPlayer = require('./objects/soundPlayer');
var textureLoader = require('./objects/textureLoader');
var objectLoader = require('./objects/objectLoader');

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
window.shake = function (value) {
	screenShake += value || 1.0;
};
Game = function()
{
	GameState.call(this);

	window.renderer = new THREE.WebGLRenderer();
	gl = renderer.context;

	var width = window.innerWidth - 100;
	var height = window.innerHeight - 100;
	window.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 20 );
	gl.viewportWidth = width; //FFS. can't query GL viewport state. this is a workaround for Particles
	gl.viewportHeight = height;

	renderer.setSize(width, height);
	document.getElementById("gamewrap").appendChild(renderer.domElement);

	var world = new World();
	console.log('created a world!');

	camera.position.z = 15;
	var cameraFocus = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	
	var sunPosition = new THREE.Vector3(-100, 50, -300);
	
	var keys = new Keyboard();

	var player = new Player({
	  world: world
	});
	var monster = new Monster({world:world});

	keys.onleft = function () {
	  player.left();
	};
	keys.onright = function () {
	  player.right();
	};
	keys.onup = function () {
		player.digUp();
	};
	keys.ondown = function () {
	  player.digDown();
	};


	
	this.bloom = new Bloom(width, height);
	window.bloom = this.bloom;
	this.particles = new Particles(64);
	
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
		
		//soundPlayer.play('test');
		
		for (var i = 0; i < 10; ++i)
		{
			particleType = 1;
			this.particles.spawn([0, 0, 2, particleType], [Math.random()*50-25, Math.random()*50-25, Math.random()*50-25, 0]);
		}
		
		this.particles.step(dt);
		
		if(monster)
			monster.updateFunc(dt,player);
	}

	var texture = THREE.ImageUtils.loadTexture('images/sky.png');
	texture.wrapS = THREE.RepeatWrapping;
	var geo = new THREE.PlaneGeometry(2, 2);
	var uvs = geo.faceVertexUvs[0];
	uvs.forEach(function (uvs) {
		uvs.forEach(function (uvs) {
			uvs.x *= width / 64;
			if (uvs.y === 0) {
				uvs.y = height / 512;
			} else {
				uvs.y = 0;
			}
		});
	});
  var backgroundMesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false
    })
  );

  var backgroundScene = new THREE.Scene();
  var backgroundCamera = new THREE.Camera();
  backgroundScene.add(backgroundCamera);
  backgroundScene.add(backgroundMesh);


	this.display = function()
	{
		this.bloom.bind();
    
    renderer.autoClear = false;
		renderer.clear();
		//renderer.render(backgroundScene, backgroundCamera );
		renderer.render(scene, camera);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.particles.draw(camera.projectionMatrix.elements, camera.matrixWorldInverse.elements);
		gl.disable(gl.BLEND);
		
		var tmp = new THREE.Vector4(sunPosition.x,sunPosition.y,sunPosition.z,1);
		tmp.applyMatrix4(camera.matrixWorldInverse);
		tmp.applyMatrix4(camera.projectionMatrix);
		tmp.x /= tmp.w;
		tmp.y /= tmp.w;
		tmp.x = tmp.x * 0.5 + 0.5;
		tmp.y = tmp.y * 0.5 + 0.5;
		this.bloom.unbind(null, tmp);
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

var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
document.body.appendChild(stats.domElement);

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

window.onload = function()
{
	setTimeout(function () {
		changeGameState(new Game());
		document.getElementById("loadingscreen").style.display = "none";
		mainloop();
	}, 50);
}

window.onresize = function(){
	var width = window.innerWidth - 100;
	var height = window.innerHeight - 100;

	gl = renderer.context;
	gl.viewportWidth = width; //FFS. can't query GL viewport state. this is a workaround for Particles
	gl.viewportHeight = height;

	renderer.setSize(width, height);

	camera.setViewOffset(width, height, 0, 0, width, height);

	// window.bloom.w = width;
	// window.bloom.h = height;
}
