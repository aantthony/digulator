var objectLoader = require('./objectLoader');

var exports = module.exports = function (details) {
  this.object = objectLoader.getObject('Monster');
  this.object.scale.x = 0.03;
  this.object.scale.y = 0.03;
  this.object.scale.z = 0.03;
  this.object.rotation.y = Math.PI;
  this.loc = {x: 10, y: -5};
  this.object.position.set(this.loc.x,this.loc.y,0.75);

  // var light = new THREE.PointLight(0xAA0000);
  // light.position.z = -3;
  // this.object.add(light);

  // The direction the monster is facing:
  this.faceX = +1;
  this.faceY = -1;

  this._world = details.world;

  scene.add(this.object);

  this.delta = 0;
  this.deltaDelay = 1.2;

  this.lastPlayerPos = undefined;
  this.goalPos = undefined;
  this.lastDir = -1;
};
exports.prototype.digLeft = function () {
	this._world.updateMonPos(this.loc.x,this.loc.y,this.loc.x-1,this.loc.y);
 this.loc.x--;
};

exports.prototype.updateFunc = function(dt,player) {
	this.delta += dt;
  this.object.position.x += 3.0 * dt * (this.loc.x - this.object.position.x);
  this.object.position.y += 3.0 * dt * (this.loc.y - this.object.position.y);
	if(this.loc.x == player._x
		&& this.loc.y == player._y)
		game.forceLoss('monstered');

	if(this.delta >= this.deltaDelay) {
		this.AI(player);
		this.delta -= this.deltaDelay;
	}
}

exports.prototype.AI = function(player) {
	var pos = this.loc;
	var pPos = {x: player._x, y: player._y};

	var x = pos.x - pPos.x;
	var y = pos.y - pPos.y;
	var squirt = Math.sqrt(x*x + y*y);

	if(squirt < 5) {
		this.lastPlayerPos = {x: pPos.x, y: pPos.y};
		this.lastDir = -1;
	}

	if(this.lastPlayerPos != undefined) {
		this.goalPos = {x: this.lastPlayerPos.x, y: this.lastPlayerPos.y};
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
				if(pos.y == -1) {
					this.lastPlayerPos = undefined;
					this.goalPos = undefined;
				} else
					this.digUp();
			}
		}
	} else {

		var dir = 0;
		while(dir == 0) {
			var r = Math.random();
			if(r < 0.25 && this.lastDir != 1 && this.canDig(pos.x-1,pos.y)) dir = 1;
			else if(r < 0.5 && this.lastDir != 4 && this.canDig(pos.x+1,pos.y)) dir = 4;
			else if(r < 0.75 && this.lastDir != 3 && this.canDig(pos.x,pos.y-1)) dir = 3;
			else if(this.lastDir != 2 && this.canDig(pos.x,pos.y+1)) dir = 2;
		}
		switch(dir) {
			case 1:
				this.digLeft();
				break;
			case 4:
				this.digRight();
				break;
			case 3:
				this.digDown();
				break;
			case 2:
				this.digUp();
				break;
		}
		this.lastDir = (5 - dir);
	}
}

exports.prototype.canDig = function(x,y) {
	if(y == 0 || this._world.monOccupy(x,y))
		return false;
	return this._world.canDig(x,y);
}

exports.prototype.digRight = function () {
  this._world.updateMonPos(this.loc.x,this.loc.y,this.loc.x+1,this.loc.y);
  this.loc.x++;
};
exports.prototype.digDown = function () {
	if(this.canDig(this.loc.x,this.loc.y-1)) {
		this._world.updateMonPos(this.loc.x,this.loc.y,this.loc.x,this.loc.y-1);
	  this.loc.y--;
	}

};
exports.prototype.digUp = function() {
	if( this.canDig(this.loc.x,this.loc.y+1)) {
	this._world.updateMonPos(this.loc.x,this.loc.y,this.loc.x,this.loc.y+1);
	this.loc.y++;
}
};
exports.prototype.faceLeft = function () {
  this.faceX = -1;
};
exports.prototype.faceRight = function () {
  this.faceX = +1;
};

exports.prototype.right = function () {
  if (this.faceX === +1 && this.canDig(this.object.position.x+1,this.object.position.y)) {
    this.digRight();
  } else {
    this.faceRight();
  }
};

exports.prototype.left = function () {
  if (this.faceX === -1 && this.canDig(this.object.position.x-1,this.object.position.y)) {
    this.digLeft();
  } else {
    this.faceLeft();
  }
};
