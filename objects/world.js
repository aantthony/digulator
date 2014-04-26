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

		var geometry = new THREE.CubeGeometry(1,1,1);
		var material = new THREE.MeshBasicMaterial({color: block.color});
		cube = new THREE.Mesh(geometry, material);
		// scene.add(cube);
		cube.name = block.name;

		return cube;
	},

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