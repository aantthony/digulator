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

var backgroundFragShader = require('./shaders/background.frag');
var backgroundVertShader = require('./shaders/background.vert');

function shakeFunction(x)
{
	var r = 0.0;
	var a = 1.0;
	for (var i = 0; i < 6; ++i)
	{
		a *= 0.8;
		var f = (1 << i);
		r += Math.sin(x * f) * a;
	}
	return r;
}
window.shakeFunction = shakeFunction;
var screenShake = 0.0;
var screenShakeTime = 0.0;
window.shake = function (value) {
	screenShake += value || 1.0;
};
Game = function()
{
	GameState.call(this);
	var game = this;

	this.renderer = new THREE.WebGLRenderer();
	window.renderer = this.renderer;
	gl = renderer.context;

	var width = window.innerWidth - 100;
	var height = window.innerHeight - 100;
	this.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 20 );
	window.camera = this.camera;
	gl.viewportWidth = width; //FFS. can't query GL viewport state. this is a workaround for Particles
	gl.viewportHeight = height;

	renderer.setSize(width, height);
	document.getElementById("gamewrap").appendChild(renderer.domElement);

	var world = new World();
	console.log('created a world!');

	this.camera.position.z = 15;
	var cameraFocus = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	
	var sunPosition = new THREE.Vector3(-100, 50, -300);
	
	var keys = new Keyboard();

	var player = new Player({
		world: world
	});
	var monster = new Monster({world:world});

	keys.onleft = function () {
		player.left();
		game.emitParticles(player.object.position, 0);
	};
	keys.onright = function () {
		player.right();
		game.emitParticles(player.object.position, 2, {x:0,y:1});
	};
	keys.onup = function () {
		player.digUp();
		game.emitParticles(player.object.position, 2, {x:1,y:0});
	};
	keys.ondown = function () {
		player.digDown();
		game.emitParticles(player.object.position, 1, {x:0,y:1});
	};

	this.bloom = new Bloom(width, height);
	window.bloom = this.bloom;
	this.particles = new Particles(64);
	
	// full screen quad:
	var geo = new THREE.PlaneGeometry(2, 2);
	var backgroundMesh = new THREE.Mesh(
		geo,
		new THREE.ShaderMaterial({
			// map: texture,
			blending: THREE.NoBlending,
			vertexShader: backgroundVertShader,
      fragmentShader: backgroundFragShader,
      uniforms: {
      	time: {type: 'f', value: 0}
      },
			depthTest: true,
			depthWrite: false
		})
	);
	backgroundMesh.position.set(0,0,1);

	var backgroundScene = new THREE.Scene();
	var backgroundCamera = new THREE.Camera();
	backgroundScene.add(backgroundCamera);
	backgroundScene.add(backgroundMesh);
	
	this.PARTICLE_SPARK = 0;
	this.PARTICLE_DIRT = 1; //needs direction
	this.PARTICLE_BEAM = 2; //needs direction
	
	this.emitParticles = function(pos, type, direction) //direction.xy
	{
		var zoff = 2.0;
		var scaleVelZ = 0.1;
		if (type == this.PARTICLE_SPARK)
		{
			var speed = 20.0;
			var spread = 0.2;
			for (var i = 0; i < 10; ++i)
				this.particles.spawn([pos.x + (Math.random()-0.5)*spread, pos.y + (Math.random()-0.5)*spread, pos.z + zoff, type], [(Math.random()-0.5)*speed, (Math.random()-0.5)*speed, (Math.random()-0.5)*speed*scaleVelZ, Math.random()*0.2]);
		}
		else if (type == this.PARTICLE_DIRT) //FIXME: might need its own colour
		{
			var speed = 2.0;
			var spread = 0.7;
			for (var i = 0; i < 50; ++i)
				this.particles.spawn([pos.x + (Math.random()-0.5)*spread, pos.y + (Math.random()-0.5)*spread, pos.z + zoff, type], [direction.x + (Math.random()-0.5)*speed, direction.y + (Math.random()-0.5)*speed, (Math.random()-0.5)*speed*scaleVelZ, -Math.random()*2.0]);
		}
		else if (type == this.PARTICLE_BEAM) //FIXME: might need its own colour
		{
			var spread = 0.05;
			var spreadTrans = 0.1;
			for (var i = 0; i < 2; ++i)
				this.particles.spawn([pos.x + direction.y*(Math.random()-0.5) * spreadTrans + (Math.random()-0.5)*spread, pos.y + direction.x*(Math.random()-0.5)*spreadTrans + (Math.random()-0.5)*spread, pos.z + zoff, type], [direction.x, direction.y, 0.0, -Math.random()]);
		}
	}
	
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
		camera.position.x = cameraFocus.x + shakeFunction(100.0 * screenShakeTime) * Math.sqrt(screenShake) * 0.03;
		camera.position.y = cameraFocus.y + shakeFunction(100.0 * screenShakeTime + 12383.23487) * Math.sqrt(screenShake) * 0.03;
		screenShake *= 0.9;
		
		this.particles.step(dt);
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
		
		player.update(dt);
		
		//soundPlayer.play('test');
		
		if(monster)
			monster.updateFunc(dt,player);
	}
	
	this.resize = function(width, height)
	{
		gl = renderer.context;
		gl.viewportWidth = width; //FFS. can't query GL viewport state. this is a workaround for Particles
		gl.viewportHeight = height;

		this.camera.setViewOffset(width, height, 0, 0, width, height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);

		this.bloom.resize(width, height)
	}
	
	this.display = function()
	{
		this.bloom.bind();
		
		renderer.autoClear = false;
		renderer.clear();
		renderer.render(scene, camera);
		renderer.render(backgroundScene, backgroundCamera );

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

	currentGameState.resize(width, height);
}
