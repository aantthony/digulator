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
var LensFlare = require('./objects/lensflare');
var soundPlayer = require('./objects/soundPlayer');
var textureLoader = require('./objects/textureLoader');
var objectLoader = require('./objects/objectLoader');
var loss = false;
var timeHack = undefined;

var backgroundFragShader = require('./shaders/background.frag');
var backgroundVertShader = require('./shaders/background.vert');

var bloom = true;
var flare = true;
var flags = window.location.hash.replace(/^#/, '').split(',');
if (~flags.indexOf('nobloom')) {
	setTimeout(function(){
		document.getElementById("bloomcheck").checked = false;
	}, 100);
	bloom = false;
}

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
var monTimer = 5;
var monTimerRate = 1.5;
var monster = [];
var numMon = 1;
window.shakeFunction = shakeFunction;
var screenShake = 0.0;
var screenShakeTime = 0.0;
window.shake = function (value) {
	screenShake += value || 1.0;
};
Game = function()
{
	setTimeout(soundPlayer.playAtmospheric, 1000);
	GameState.call(this);
	window.game = this;

	this.renderer = new THREE.WebGLRenderer();
	window.renderer = this.renderer;
	gl = renderer.context;

	var width = window.innerWidth;
	var height = window.innerHeight;
	this.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 50 );
	window.camera = this.camera;
	gl.viewportWidth = width; //FFS. can't query GL viewport state. this is a workaround for Particles
	gl.viewportHeight = height;

	renderer.setSize(width, height);
	document.getElementById("gamewrap").appendChild(renderer.domElement);

	this.world = new World();
	window.world = this.world;
	console.log('created a world!');

	this.camera.position.z = 12;
	var cameraFocus = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	
	var sunPosition = new THREE.Vector3(-5, 5, -30);
	
	this.keys = new Keyboard();

	var player = new Player({
		world: world,
		game: game,
		keys: this.keys
	});

	this.bloom = new Bloom(width, height);
	window.bloom = this.bloom;
	this.particles = new Particles(64);
	
	this.lensflare = new LensFlare();
	
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
      	aspect: {type: 'f', value: width / height },
      	sun: {type: 'v2', value: new THREE.Vector2(0,0) }
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
	this.PARTICLE_GLOW = 3;
	
	this.emitParticles = function(pos, type, direction) //direction.xy
	{
		var zoff = 1.0;
		var scaleVelZ = 0.1;
		if (type == this.PARTICLE_SPARK)
		{
			var speed = 20.0;
			var spread = 0.2;
			for (var i = 0; i < 2; ++i)
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
		else if (type == this.PARTICLE_GLOW)
		{
			var spread = 0.4;
			for (var i = 0; i < 1; ++i)
				this.particles.spawn([pos.x + (Math.random()-0.5)*spread, pos.y + (Math.random()-0.5)*spread, pos.z + zoff, type], [0,0,0,0]);
		}
		else
			console.log("Error: invalid particle type in game.emitParticles()");
	};
	
	this.camera.spinning = false;
	this.beginSpin = function()
	{
		this.camera.spinning = true;
		this.camera.spinTime = 0.0;
		this.camera.fovBak = this.camera.fov;
	};
	
	this.enter = function()
	{
		// cube = new Digulator.Sand();
		// scene.add(cube);

		loss = false;
		world.createWorld();
		this.createMonster();
		this.setUpHUD();
	};
	this.fixedUpdate = function(dt)
	{
		var playerpos = player.object.position;
		var targetX = Math.max(-50, Math.min(40, playerpos.x - 5)) + 5;
		var targetY = Math.max(-50, Math.min(40, playerpos.y - 5)) + 5;
		cameraFocus.x += (targetX - cameraFocus.x) * 0.04;
		cameraFocus.y += (targetY - cameraFocus.y) * 0.04;
	
		screenShakeTime += dt;	
		camera.position.x = cameraFocus.x + shakeFunction(100.0 * screenShakeTime) * Math.sqrt(screenShake) * 0.03;
		camera.position.y = cameraFocus.y + shakeFunction(100.0 * screenShakeTime + 12383.23487) * Math.sqrt(screenShake) * 0.03;
		screenShake *= 0.9;
		if (this.camera.spinning)
		{
			this.camera.spinTime += dt * 2.0;
			if (this.camera.spinTime < 3.0)
			{
				this.camera.fov = 10 + (this.camera.fovBak-10) * (0.5+0.5*Math.cos(this.camera.spinTime * Math.PI * 2.0));
				this.camera.updateProjectionMatrix();
			}
			else if (this.camera.spinTime < 4.0)
			{
				camera.rotation.z = (this.camera.spinTime - 3.0) * Math.PI * 2.0;
			}
			else
			{
				this.camera.fov = this.camera.fovBak;
				this.camera.updateProjectionMatrix();
				camera.rotation.z = 0.0;
				window.shake(200.0);
				this.camera.spinning = false;
			}
		}
		
		this.particles.step(dt);
		
		this.world.update(dt);
	}

	this.createMonster = function() {
		monster[numMon] = new Monster({world:world});
		numMon += 1;
		console.log("creating monster");
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
			this.updateTimerHUD();
			//screenShake += 4.0;
		}
		game.updateDepth();
		
		player.update(dt);
		
		//soundPlayer.play('test');
		
		if(monster != undefined) {
			for(var i = 0; i < numMon; ++ i)
				if(monster[i] != undefined)
					monster[i].updateFunc(dt,player);
		}
	};

	this.setUpHUD = function() {
		if(timeHack != undefined)
			document.getElementById("timeBack").innerHTML = timeHack;
		document.getElementById("time").innerHTML = 0;
		document.getElementById("gold").innerHTML = 0;
		document.getElementById("depthometer").innerHTML = 0;
		document.getElementById("vsdiv").style.display = "block";
		this.updateDepth();
		document.getElementById("hud").style.display = "block";
	};
	
	this.updateTimerHUD = function() {
		if(loss != true) {
			var i = document.getElementById("time").innerHTML;
			if(i >= monTimer) {
				this.createMonster();
				monTimer = monTimer + (monTimerRate * monTimer);
				console.log(monTimer+"mtimer");
			} else
				document.getElementById("time").innerHTML = (parseInt(i) + 1);
		}
	};

	this.forceLoss = function(losstype) {
		if (loss)
		{
			// console.log("Game.forceLoss but already in loss state");
			return;
		}
		loss = true;

		
		switch(losstype) {
			case 'timeout':
				timeHack = document.getElementById("timeBack").innerHTML;
				document.getElementById("timeBack").innerHTML = "Time's Up!";
				document.getElementById("timeBack").style.textAlign = "center";
				document.getElementById("lossText").innerHTML = "Outta Time!";
				break;
			case 'monstered':
				this.beginSpin();
				soundPlayer.play('Ending');
				// document.getElementById("lossText").innerHTML = "MONSTERED!";
				break;
		}
		
		this.keys.disable(); //disable input when lost
		
		//changeGameState(new LossState());
		// swap when game state changes properly
		document.getElementById("loss").style.display = "block";
	}

	this.updateDepth = function() {
		document.getElementById("depthometer").innerHTML = Math.round( (-player.object.position.y) * 10 ) / 10;
	}

	this.updateScore = function(name) {
		var score = 0;
		switch(name) {
			case 'gold':
				soundPlayer.play('Gold');
				score = 10;
				break;
			case 'diamond':
				soundPlayer.play('Gold');
				score = 50;
				break;
			case 'rock':
				score = 1;
				break;
			default:
				break;
		}
		var t = document.getElementById("gold").innerHTML;
		document.getElementById("gold").innerHTML = parseInt(t) + parseInt(score);
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

		this.bloom.resize(width, height);

		backgroundMesh.material.uniforms.aspect.value = width / height;
	}
	
	this.display = function()
	{
		var sunpos = new THREE.Vector4(sunPosition.x,sunPosition.y,sunPosition.z,1);
		sunpos.applyMatrix4(camera.matrixWorldInverse);
		sunpos.applyMatrix4(camera.projectionMatrix);
		sunpos.x /= sunpos.w;
		sunpos.y /= sunpos.w;
		sunpos.x = sunpos.x * 0.5 + 0.5;
		sunpos.y = sunpos.y * 0.5 + 0.5;
		backgroundMesh.material.uniforms.sun.value.copy(sunpos);
		
		if (bloom) this.bloom.bind();
		
		renderer.autoClear = false;
		renderer.clear();
		renderer.render(backgroundScene, backgroundCamera );
		renderer.render(scene, camera);

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.particles.draw(camera.projectionMatrix.elements, camera.matrixWorldInverse.elements);
		gl.disable(gl.BLEND);
		if (bloom)
			this.bloom.unbind(null, sunpos);
		
		if (sunPosition.y + (0.0 - sunPosition.z) * (camera.position.y - sunPosition.y)/(camera.position.z - sunPosition.z) > -0.5){
			if(flare)
				this.lensflare.draw(sunpos, camera.aspect);
		}
	}
}

MainMenu = function()
{
	GameState.call(this);
	
	this.startGame = function()
	{
		// alert("qwe");
		changeGameState(new Game());
	}
	
	//change this to the start game event thing and stuff
	document.getElementById("start").onclick = this.startGame.bind(this);
	
	this.enter = function()
	{
		document.getElementById("relative").style.display = "none";
		document.getElementById("startscreen").style.display = "block";
	}
	this.leave = function()
	{
		document.getElementById("relative").style.display = "block";
		document.getElementById("startscreen").style.display = "none";
	}
}

LossState = function() {
	GameState.call(this);

	this.startNewGame = function() {
		changeGameState(new Game())
	}

	this.mainMenu = function() {
		document.getElementById("relative").style.display = "none";
		changeGameState(new MainMenu());
	}

	document.getElementById("rs").onclick = this.startNewGame.bind(this);
	document.getElementById("mm").onclick = this.mainMenu.bind(this);

	this.enter = function() {
		loss = true;
		document.getElementById("loss").style.display = "block";
	}

	this.leave = function() {
		loss = false;
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

/*var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
document.body.appendChild(stats.domElement);*/

var lastTime = 0.0;
var sleepTime = 0.0;
var targetFrametime = 1000.0/60.0;
var javascriptUsage = 0.0;
var sleepTime = 0.0;
var mainloop = function()
{
	// stats.begin();
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
	// stats.end();
}

window.onload = function()
{
	//randomize author order on page load
	var authors = document.getElementById("authors");
	var children = [];
	for (var i = 0; i < authors.childNodes.length; ++i)
		if (authors.childNodes[i].nodeName == "DIV")
			children.push(authors.childNodes[i]);
	while (children.length)
		authors.appendChild(children.splice(Math.floor(Math.random()*children.length), 1)[0]);

	setTimeout(function () {
		changeGameState(new MainMenu());
		//changeGameState(new Game());
		document.getElementById("loadingscreen").style.display = "none";
		mainloop();
	}, 50);
	document.getElementById("volslider").addEventListener('change',function (){
		soundPlayer.setVolume(this.value);
	});
	document.getElementById("volslider").addEventListener('focus',function (){
		this.blur();
	});
	document.getElementById("bloomcheck").addEventListener('click',function (){
		bloom = !bloom;
	});
	document.getElementById("flarecheck").addEventListener('click',function (){
		flare = !flare;
	});
	document.getElementById("reset1").addEventListener('click',function (){
		location.reload();
	});
	document.getElementById("reset2").addEventListener('click',function (){
		location.reload();
	});
}

window.onresize = function(){
	var width = window.innerWidth;
	var height = window.innerHeight;

	currentGameState.resize(width, height);
}


