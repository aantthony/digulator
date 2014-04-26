var exports = module.exports = function (details) {

  var geometry = new THREE.CubeGeometry(0.4,0.4, 0.4);
  var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
  this.object = new THREE.Mesh(geometry, material);

  this.object.position.set(4,2,-0.5);
  this.object.rotation.set(1.4,0,0);

  // The direction the monster is facing:
  this.faceX = +1;
  this.faceY = -1;

  this._world = details.world;

  scene.add(this.object);

  this.delta = 0;
  this.deltaDelay = 1.2;

  this.lastPlayerPos = undefined;
  this.goalPos = undefined;
};
exports.prototype.digLeft = function () {
 this.object.position.x--;
};

exports.prototype.updateFunc = function(dt,player) {
	this.delta += dt;
	if(this.delta >= this.deltaDelay) {
		this.AI(player);
		this.delta -= this.deltaDelay;
	}
}

exports.prototype.AI = function(player) {
	var pos = this.object.position;
	var pPos = player.object.position;

	var x = pos.x - pPos.x;
	var y = pos.y - pPos.y;
	var squirt = Math.sqrt(x*x + y*y);

	if(squirt < 5) {
		this.lastPlayerPos = pPos.clone();
	}

	if(this.lastPlayerPos != undefined) {
		this.goalPos = this.lastPlayerPos.clone();
	}

	if(this.goalPos != undefined && pos.x == this.goalPos.x && pos.y == this.goalPos.y && squirt >= 5) {
		this.goalPos = undefined;
		this.lastPlayerPos = undefined;
	}

	if(this.goalPos != undefined) {
		if(Math.abs(pos.x - this.goalPos.x) > Math.abs(pos.y - this.goalPos.y)) {
			if(x > 0) {
				this.left();
			} else {
				this.right();
			}
		} else if(squirt != 0) {
			if(y > 0) {
				this.digDown();
			} else {
				this.digUp();
			}
		}
	} else {
		var r = Math.random();
		if(r < 0.25) this.digLeft();
		else if(r < 0.5) this.digRight();
		else if(r < 0.75) this.digDown();
		else this.digUp();
	}
}

exports.prototype.digRight = function () {
  this.object.position.x++;
};
exports.prototype.digDown = function () {
  this.object.position.y--;

};
exports.prototype.digUp = function() {
	this.object.position.y++;
};
exports.prototype.faceLeft = function () {
  this.faceX = -1;
};
exports.prototype.faceRight = function () {
  this.faceX = +1;
};

exports.prototype.right = function () {
  if (this.faceX === +1) {
    this.digRight();
  } else {
    this.faceRight();
  }
};

exports.prototype.left = function () {
  if (this.faceX === -1) {
    this.digLeft();
  } else {
    this.faceLeft();
  }
};
