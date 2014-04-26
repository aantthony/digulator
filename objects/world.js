module.exports = World;

function World() {
	this.blocks = [],

	this.createWorld = function(){
		this.blocks = [];
		for(var i = 0; i < 10; i++){
			this.blocks[i] = [];
		}

		var cube;
		for(var i = 0; i < 10; i++){
			for(var j = 0; j < 10; j++){
				var cube = this.makeBlock();
				cube.position.x = i;
				cube.position.y = j;
				scene.add(cube);
				this.blocks[i][j] = cube;
			}
		}
	},

	this.makeBlock = function(){
		var block = this.chooseBlock();

		var geometry = new THREE.CubeGeometry(0.8 + Math.random() * 0.1,0.8 + Math.random () * 0.1,0.95);
		var material = new THREE.MeshLambertMaterial({color: block.color});
		cube = new THREE.Mesh(geometry, material);
		cube.rotation.set((Math.random() - 0.5) * 0.9, (Math.random()-0.5) * 0.9, 0.0);
		// scene.add(cube);
		cube.name = block.name;
		block.strength = 2;

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
		cube = this.makeBlock();
		cube.material.color.set(0xffff00);
		cube.name = name;
		cube.position.set(x, y, 0);
		col[y] = cube;
		scene.add(cube);
		return cube;
	};

	this.chooseBlock = function(){
		var i = Math.floor(Math.random()*6);
		switch(i){
			case 0:
				return {
					name: 'sand',
					color: 0xFFFF00
				}
			case 1:
				return {
					name: 'dirt',
					color: 0xFFAA00
				}
			case 2:
				return {
					name: 'clay',
					color: 0xFF5500
				}
			case 3:
				return {
					name: 'rock',
					color: 0xAAAAAA
				}
			case 4:
				return {
					name: 'gold',
					color: 0xFFFF00
				}
			case 5:
				return {
					name: 'diamond',
					color: 0x0000FF
				}
			default:
				return {
					name: 'empty',
					color: 0x000000
				}
		}
	}
}