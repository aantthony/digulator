//parent Block Object
Digulator.Block = function(options){
	var options = options || {};

	this.object = new THREE.Mesh(new CubeGeometry(), this.material);

	scene.add(this.object);
};

Digulator.Block.prototype = {
	something: function(){
		return undefined;
	},
}
