module.exports = World;

var SAND = 1;
var DIRT = 2;
var CLAY = 3;
var ROCK = 4;
var GOLD = 5;
var DIAMOND = 6;
var EMPTY = 7;
var width = 15;
var height = 5;
var NUMDIAMONDS = 2;
var NUMSPACE = 4;

var objectLoader = require('./objectLoader');
var soundPlayer = require('./soundPlayer');

function World() {
	this.objectLoader = objectLoader;
	this.blocks = [],
	this.palms = [],
	this.leaves = [];
	
	this.update = function(dt){
		var remleaves = [];
		for (var l in this.leaves)
		{
			var leaf = this.leaves[l];
			leaf.time += dt;
			leaf.position.y -= dt * 0.2;
			leaf.position.x += Math.sin(leaf.time * 4.0) * dt;
			leaf.position.y += Math.pow(Math.abs(Math.cos(leaf.time * 4.0+0.5)),6) * dt * 0.4;
			if (leaf.position.y < 10.0) //FIXME: 10... ?? wtf
				remleaves.push(l);
		}
		for (var i = remleaves.length-1; i >= 0; --i)
		{
			scene.remove(this.leaves[remleaves[i]]);
			delete this.leaves[remleaves[i]];
		}
	};

	this.createWorld = function(){
		this.blocks = [];
		if(height < 5)
			height = 5;
		for(var i = 0; i < width; i++){
			this.blocks[i] = [];
		}
		if(NUMSPACE >= ((width + height) / 4) - 1)
			NUMSPACE = Math.floor((width + height) / 4) - 1;
		NUMDIAMONDS = Math.floor((width + height) / 20) + 1;

		for(var i = 1; i < width; i++){
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
	
	this.createLeaves = function(pos){
		for (var i = 0; i < 3; ++i)
		{
			var leaf = objectLoader.getObject('Palm');

			leaf.scale.x = leaf.scale.y = leaf.scale.z = Math.random()*0.001+0.005;

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
	};

	this.destroyPalm = function(x){
		if(!this.palms[x]){
			return;
		}
		scene.remove(this.palms[x]);
		soundPlayer.play('Leaves');
		
		var pos = new THREE.Vector3(0, 200, 0);
		pos.applyMatrix4(this.palms[x].matrixWorld);
		this.createLeaves(pos);
		
		this.palms[x] = undefined;
	};

	this.makeBlock = function(type,i,j){
		var block = this.chooseBlock(type);
		var cube = block.mesh;

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
		var numGold = Math.floor(((width * height) + 2) * 0.04);
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
		var numRock = (width * height) * 0.05;
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