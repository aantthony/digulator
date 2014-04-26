//Sand Object
Digulator.Sand = function(options){
	var options = options || {};

	this.material = new THREE.MeshLambertMaterial({color: 0xFFFF00});
	
	Digulator.Filter.call(this, options);
};

Digulator.EdgeDetector.prototype = Object.create( Digulator.Filter.prototype );

Digulator.Sand.prototype = {
	something: function(){
		return undefined;
	},
}
