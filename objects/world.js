module.exports = World;

var SAND = 1;
var DIRT = 2;
var CLAY = 3;
var ROCK = 4;
var GOLD = 5;
var DIAMOND = 6;
var EMPTY = 7;
var size = 10;
var NUMDIAMONDS = 2;
var NUMSPACE = 4;

var objectLoader = require('./objectLoader');

function World() {
	this.objectLoader = objectLoader;
	this.blocks = [],

	this.createWorld = function(){
		this.blocks = [];
		for(var i = 0; i < size; i++){
			this.blocks[i] = [];
		}
		if(NUMSPACE >= size / 2)
			NUMSPACE = Math.floor(size / 2);
		NUMDIAMONDS = Math.floor(size / 10) + 1;
		this.addDiamonds();
		this.addGold();
		this.addRocks();

		for(var i = 0; i < size; i++) {
			for(var j = 0; j < size; j++) {
				if(this.blocks[i][j] == undefined) {
					if(j == 0) {
						this.makeBlock(EMPTY,i,j);
					} else {
						var r = Math.random();
						if(r < 0.5)
							this.makeBlock(DIRT,i,j);
						else if(r < 0.8)
							this.makeBlock(CLAY,i,j);
						else
							this.makeBlock(SAND,i,j);
					}
				}

			}
		}
	},

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
	},

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

	this.chooseBlock = function(type){
		var geometry = new THREE.CubeGeometry(0.95 + Math.random() * 0.1,0.95 + Math.random () * 0.1,0.95);
		var material;
		switch(type){
			case SAND:
			case 'sand':
				return {
					mesh: this.objectLoader.getObject('Sand'),
					name: 'sand',
				}
			case DIRT:
				return {
					mesh: this.objectLoader.getObject('Dirt'),
					name: 'dirt'
				}
			case CLAY:
				return {
					mesh: this.objectLoader.getObject('Clay'),
					name: 'clay',
				}
			case ROCK:
				return {
					mesh: this.objectLoader.getObject('Rock'),
					name: 'rock',
				}
			case GOLD:
				return {
					mesh: this.objectLoader.getObject('Gold'),
					name: 'gold',
				}
			case DIAMOND:
				material = new THREE.MeshLambertMaterial({color: 0x0000FF});
				return {
					mesh: new THREE.Mesh(geometry, material),
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
			var x = Math.floor(Math.random()*size);
			var y = Math.floor(Math.random()*size);
			fail = false;
			while(y < 4)
				y = Math.floor(Math.random()*size);

			if(this.blocks[x][y] == undefined) {
				for(var a = Math.max(x - NUMSPACE,0); a < Math.min(x + NUMSPACE,size); ++ a) {
					for(var b = Math.max(y - NUMSPACE,0); b < Math.min(y + NUMSPACE,size); ++ b) {
						if((a == 0 && b == 0) || (this.blocks[a][b] != undefined && this.blocks[a][b].name == 'diamond'))
							fail = true;
					}
				}
				
			} else 
				fail = true;

			if(fail == true)
				-- i;
			else
				this.makeBlock(DIAMOND,x,y);
		}
	}

	this.addGold = function() {
		var numGold = Math.floor(((size * size) + 2) * 0.04);
		var fail = false;
		for(var i = 0; i < numGold; ++ i) {
			var x = Math.floor(Math.random()*size);
			var y = Math.floor(Math.random()*size);
			fail = false;
			while(y < 3)
				y = Math.floor(Math.random()*size);
			
			if(this.blocks[x][y] == undefined) {
				for(var a = Math.max(x - (NUMSPACE/2),0); a < Math.min(x + (NUMSPACE/2),size); ++ a) {
					for(var b = Math.max(y - (NUMSPACE/2),0); b < Math.min(y + (NUMSPACE/2),size); ++ b) {
						if((a == 0 && b == 0) || (this.blocks[a][b] != undefined && (this.blocks[a][b].name == 'diamond' || this.blocks[a][b].name == 'gold')))
							fail = true;
					}
				}
				
			} else 
				fail = true;

			if(fail == true)
				-- i;
			else
				this.makeBlock(GOLD,x,y);
		}
	}

	this.addRocks = function() {
		var numRock = (size * size) * 0.05;
		if(size > 2) numRock += 2;
		
		for(var i = 0; i < numRock; ++ i) {
			var x = Math.floor(Math.random()*size);
			var y = Math.floor(Math.random()*size);
			while(y < 1)
				y = Math.floor(Math.random()*size);
				
			if(this.blocks[x][y] == undefined) {
				this.makeBlock(ROCK,x,y);
				var r = Math.random();
				if(r < 0.5) {
					if(x != size - 1 && this.blocks[x+1][y] == undefined) this.makeBlock(ROCK,x+1,y);
					else if(x != 0 && this.blocks[x-1][y] == undefined) this.makeBlock(ROCK,x-1,y);
					else if(y != size - 1 && this.blocks[x][y+1] == undefined) this.makeBlock(ROCK,x,y+1);
					else if(y != 0 && this.blocks[x][y-1] == undefined) this.makeBlock(ROCK,x,y-1);
				} else {
					if(y != size - 1 && this.blocks[x][y+1] == undefined) this.makeBlock(ROCK,x,y+1);
					else if(y != 0 && this.blocks[x][y-1] == undefined) this.makeBlock(ROCK,x,y-1);
					else if(x != size - 1 && this.blocks[x+1][y] == undefined) this.makeBlock(ROCK,x+1,y);
					else if(x != 0 && this.blocks[x-1][y] == undefined) this.makeBlock(ROCK,x-1,y);
					
				}
			} else
				-- i;
		}
	}
}

