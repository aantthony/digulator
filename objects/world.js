module.exports = World;

var SAND = 1;
var DIRT = 2;
var CLAY = 3;
var ROCK = 4;
var GOLD = 5;
var DIAMOND = 6;
var EMPTY = 7;
var width = 32;
var height = 12;
var NUMDIAMONDS = 10;
var NUMSPACE = 4;

var objectLoader = require('./objectLoader');
var soundPlayer = require('./soundPlayer');
var textureLoader = require('./textureLoader');

function World() {
	this.objectLoader = objectLoader;
	this.blocks = [];
	this.palms = [];
	this.leaves = [];
	this.trunks = [];
	this.grass = [];
	this.sign = [];
	
	this.particleEmitters = [];
	this.emitTimer = 0.0;
	
	this.update = function(dt){
	
		this.emitTimer += dt;
		if (this.emitTimer > 0.1)
		{
			this.emitTimer = 0.0;
			var i = Math.floor(Math.random() * this.particleEmitters.length);
			game.emitParticles({x:this.particleEmitters[i][0], y:this.particleEmitters[i][1],z:0}, game.PARTICLE_GLOW);
		}
	
	
		var remleaves = [];
		for (var l in this.leaves)
		{
			var leaf = this.leaves[l];
			leaf.time += dt;
			leaf.position.y -= dt * 0.6;
			leaf.position.x += Math.sin(leaf.time * 4.0) * dt;
			leaf.position.y += Math.pow(Math.abs(Math.cos(leaf.time * 4.0+0.5)),6) * dt * 0.4;
			leaf.rotation.x += dt * 0.5;
			leaf.rotation.z += dt * 2.0;
			if (leaf.position.y < -0.3)
				remleaves.push(l);
		}
		for (var i = remleaves.length-1; i >= 0; --i)
		{
			scene.remove(this.leaves[remleaves[i]]);
			delete this.leaves[remleaves[i]];
		}
		var remtrunks = [];
		for (var l in this.trunks)
		{
			var trunk = this.trunks[l];
			trunk.time += dt * 0.4;
			trunk.fall += trunk.time * dt;
			trunk.rotation.z -= trunk.fall * dt;
			if (trunk.fall > 1.6)
			{
				remtrunks.push(l);
				for (var i = 0; i < 10; ++i)
				{
					var pos = new THREE.Vector3(0, i * 330.0/10.0, 0, 1);
					pos.applyMatrix4(trunk.matrixWorld);
					game.particles.spawn([pos.x, pos.y, pos.z, 1], [Math.random()-0.5,Math.random()*2.0+1.0,0,0]);
				}
			}
		}
		for (var i = remtrunks.length-1; i >= 0; --i)
		{
			scene.remove(this.trunks[remtrunks[i]]);
			delete this.trunks[remtrunks[i]];
		}
		
		this.grassMat.uniforms.time.value += dt;
	};

	this.createWorld = function(){
	
		this.sign = objectLoader.getObject('Sign');
		this.sign.position.x = width/2-2;
		this.sign.scale.x = 0.05;
		this.sign.scale.y = 0.05;
		this.sign.scale.z = 0.05;
		this.sign.position.z = -1;
		this.sign.rotation.y = Math.PI;
		scene.add(this.sign);

		this.blocks = [];
		if(height < 5)
			height = 5;
		for(var i = 0; i < width; i++){
			this.blocks[i] = [];
		}
		if(NUMSPACE >= ((width + height) / 4) - 1)
			NUMSPACE = Math.floor((width + height) / 4) - 1;
		NUMDIAMONDS = Math.floor((width + height) / 20) + 1;

		var boundaryMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(width * 2, height * 2),
			new THREE.MeshBasicMaterial({
				color: 0,
				depthTest: false,
				depthWrite: false
			})
		);
		boundaryMesh.position.set(width / 2,-height - 0.5,0);
		scene.add(boundaryMesh);

		for(var i = 0; i < width; i++){
			var tree = objectLoader.getObject('Palm');

			tree.scale.x = 0.005;
			tree.scale.y = 0.005+(Math.random()*0.002-0.001);
			tree.scale.z = 0.005;

			tree.rotation.x = Math.random()*0.25-0.125;
			tree.rotation.y = Math.random()*Math.PI*2;
			tree.rotation.z = Math.random()*0.25-0.125;

			tree.position.x = i + Math.random()*0.5-0.25;
			tree.position.y = -0.5
			tree.position.z = Math.random()*0.5-0.25;
			scene.add(tree);
			this.palms.push(tree);
		}
		
		var grasswidth = 4;
		var grassFragShader = require('../shaders/grass.frag');
		var grassVertShader = require('../shaders/grass.vert');
		var grassGeom = new THREE.PlaneGeometry(grasswidth, grasswidth*128/1024);
		var grassTex = textureLoader.getTexture("Grass");
		grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
		var grassMat = new THREE.ShaderMaterial({
			blending: THREE.NormalBlending,
			vertexShader: grassVertShader,
			fragmentShader: grassFragShader,
			uniforms: {time: {type: 'f', value: 0.0}, texture: {type: 't', value: grassTex}},
			transparent: true,
			depthTest: true,
			depthWrite: false
		});
		this.grassMat = grassMat;
		for (var i = 0; i < width / grasswidth; ++i)
		{
			var grass = new THREE.Mesh(grassGeom, grassMat);
			grass.position.set((i+0.5)*grasswidth-0.5,0.5*grasswidth*128/1024-0.55,0.5);
			scene.add(grass);
			this.grass.push(grass);
		}

		this.addDiamonds();
		this.addGold();
		this.addRocks();

		for(var i = 0; i < width; i++) {
			for(var j = -height; j < 0; j++) {
				if(this.blocks[i][j] == undefined) {
					if(j == 0) {
						this.makeBlock(EMPTY,i,j);
					} else {
						var r = Math.random();
						if(r < 0.5)
							this.makeBlock(DIRT,i,j);
						else if(r < 0.9)
							this.makeBlock(CLAY,i,j);
						else
							this.makeBlock(SAND,i,j);
					}
				}

			}
		}
		
	};

	this.destroyPalm = function(x){
	
		if(!this.palms[x]){
			return;
		}
		scene.remove(this.palms[x]);
		soundPlayer.play('Leaves');
		
		var pos = new THREE.Vector3(0, 330, 0);
		pos.applyMatrix4(this.palms[x].matrixWorld);
		
		for (var i = 0; i < 3; ++i)
		{
			var leaf = objectLoader.getObject('Leaf');

			leaf.scale.x = leaf.scale.y = leaf.scale.z = Math.random()*0.02+0.04;

			leaf.rotation.x = Math.random()*0.25-0.125;
			leaf.rotation.y = Math.random()*Math.PI*2;
			leaf.rotation.z = Math.random()*0.25-0.125;

			leaf.position.copy(pos);
			
			leaf.time = Math.random() * 3.0;
			
			leaf.position.x += Math.random()*0.5-0.25;
			leaf.position.y += Math.random()*0.5-0.25;
			
			scene.add(leaf);
			this.leaves.push(leaf);
		}
		
		var trunk = objectLoader.getObject('Trunk');
		trunk.scale.copy(this.palms[x].scale);
		trunk.position.copy(this.palms[x].position);
		trunk.rotation.copy(this.palms[x].rotation);
		trunk.time = 0.0;
		trunk.fall = 0.0;
		scene.add(trunk);
		this.trunks.push(trunk);
		
		this.palms[x] = undefined;
	};

	this.makeBlock = function(type,i,j){
		var block = this.chooseBlock(type);
		var cube = block.mesh;
		
		if (type == GOLD || type == DIAMOND)
			this.particleEmitters.push([i, j]);

		// cube.rotation.set((Math.random() - 0.5) * 0.2, (Math.random()-0.5) * 0.2, 0.0);
		cube.rotation.set(Math.PI/2 * Math.floor(Math.random()*8), Math.PI/2 * Math.floor(Math.random()*8), 0.0);
		// scene.add(cube);
		cube.name = block.name;
		cube.position.x = i;
		cube.position.y = j;
		scene.add(cube);
		this.blocks[i][j] = cube;

		return cube;
	};

	this.getBlock = function (x, y) {
		var col = this.blocks[x];
		if (!col) return;
		return col[y] || undefined;
	};

	this.setBlock = function (x, y, name) {
		var old;
		var col = this.blocks[x];
		if (old = col[y]) {
			scene.remove(old);
			delete col[y];
		}
		if (!name) return;
		cube = this.makeBlock(name, x, y);
		// cube.material.color.set(0xffff00);
		cube.name = name;
		cube.position.set(x, y, 0);
		col[y] = cube;
		scene.add(cube);
		return cube;
	};

	this.canDig = function (x, y) {
		if (x < 0) return false;
		if (y > 0) return false;
		if (x >= width) return false;
		if (y < -height) return false;
		return true;
	};

	this.chooseBlock = function(type){
		var geometry = new THREE.CubeGeometry(1, 1, 1);
		var material;
		switch(type){
			case SAND:
			case 'sand':
				return {
					mesh: this.objectLoader.getObject('Sand'),
					name: 'sand',
				}
			case DIRT:
			case 'dirt':
				return {
					mesh: this.objectLoader.getObject('Dirt'),
					name: 'dirt'
				}
			case CLAY:
			case 'clay':
				return {
					mesh: this.objectLoader.getObject('Clay'),
					name: 'clay',
				}
			case ROCK:
			case 'rock':
				return {
					mesh: this.objectLoader.getObject('Rock'),
					name: 'rock',
				}
			case GOLD:
			case 'gold':
				return {
					mesh: this.objectLoader.getObject('Gold'),
					name: 'gold',
				}
			case DIAMOND:
			case 'diamond':
				return {
					mesh: this.objectLoader.getObject('Diamond'),
					name: 'diamond',
				}
			default:
				material = new THREE.MeshLambertMaterial({color: 0x000000});
				return {
					mesh: new THREE.Mesh(geometry, material),
					name: 'empty',
				}
		}
	}

	this.addDiamonds = function() {
		var fail = false;
		for(var i = 0; i < NUMDIAMONDS; ++ i) {
			var x = Math.floor(Math.random()*width);
			var y = Math.floor(Math.random()*height);
			fail = false;
			while(y < (height * 0.6))
				y = Math.floor(Math.random()*height);

			if(this.blocks[x][y] == undefined) {
				for(var a = Math.floor(Math.max(x - NUMSPACE,0)); a < Math.min(x + NUMSPACE,width); ++ a) {
					for(var b = Math.floor(Math.max(y - NUMSPACE,0)); b < Math.min(y + NUMSPACE,height); ++ b) {
						if(this.blocks[a][b] != undefined && this.blocks[a][b].name == 'diamond')
							fail = true;
					}
				}
				
			} else 
				fail = true;

			if(fail == true)
				-- i;
			else
				this.makeBlock(DIAMOND,x,-y);
		}
	}

	this.addGold = function() {
		var numGold = Math.floor(((width * height) + 2) * 0.1);
		var fail = false;
		for(var i = 0; i < numGold; ++ i) {
			var x = Math.floor(Math.random()*width);
			var y = Math.floor(Math.random()*height);
			fail = false;
			while(y < (height * 0.4))
				y = Math.floor(Math.random()*height);
			
			if(this.blocks[x][y] == undefined) {
				for(var a = Math.floor(Math.max(x - (NUMSPACE/2),0)); a < Math.min(x + (NUMSPACE/2),width); ++ a) {
					for(var b = Math.floor(Math.max(y - (NUMSPACE/2),0)); b < Math.min(y + (NUMSPACE/2),height); ++ b) {
						if(this.blocks[a][b] != undefined && (this.blocks[a][b].name == 'diamond' || this.blocks[a][b].name == 'gold'))
							fail = true;
					}
				}
				
			} else 
				fail = true;

			if(fail == true)
				-- i;
			else
				this.makeBlock(GOLD,x,-y);
		}
	}

	this.addRocks = function() {
		var numRock = (width * height) * 0.25;
		if(width > 2 || height > 2) numRock += 2;
		
		for(var i = 0; i < numRock; ++ i) {
			var x = Math.floor(Math.random()*width);
			var y = Math.floor(Math.random()*height);
			while(y < 2)
				y = Math.floor(Math.random()*height);
				
			if(this.blocks[x][y] == undefined) {
				this.makeBlock(ROCK,x,-y);
				var r = Math.random();
				if(r < 0.5) {
					if(x != width - 1 && this.blocks[x+1][y] == undefined) this.makeBlock(ROCK,x+1,-y);
					else if(x != 0 && this.blocks[x-1][y] == undefined) this.makeBlock(ROCK,x-1,-y);
					else if(y != height - 1 && this.blocks[x][y+1] == undefined) this.makeBlock(ROCK,x,-y+1);
					else if(y != 0 && this.blocks[x][y-1] == undefined) this.makeBlock(ROCK,x,-y-1);
				} else {
					if(y != height - 1 && this.blocks[x][y+1] == undefined) this.makeBlock(ROCK,x,-y+1);
					else if(y != 0 && this.blocks[x][y-1] == undefined) this.makeBlock(ROCK,x,-y-1);
					else if(x != width - 1 && this.blocks[x+1][y] == undefined) this.makeBlock(ROCK,x+1,-y);
					else if(x != 0 && this.blocks[x-1][y] == undefined) this.makeBlock(ROCK,x-1,-y);
					
				}
			} else
				-- i;
		}
	}
}
