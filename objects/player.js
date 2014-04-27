var soundPlayer = require('./soundPlayer');

var exports = module.exports = function (details) {

  var geometry = new THREE.CubeGeometry(0.4,0.4, 0.4);
  var material = new THREE.MeshBasicMaterial({color: 0x0066CC, depthTest: false});
  this.object = new THREE.Mesh(geometry, material);

  var light = new THREE.PointLight(0xFFFFFF);
  light.position.y = 3;
  this.object.add(light);

  this.object.position.set(0,10,0);
  this.object.rotation.set(1.4,0,0);

  // The direction the player is facing:
  this.faceX = +1;
  this.faceY = +1;

  this._world = details.world;

  // timer for current digging action:
  this._currentDig = null;
  // current dig direction (if _currentDig is falsy, then this should be zero)
  this._currentDigX = 0;
  this._x = Math.round(this.object.position.x);
  this._y = Math.round(this.object.position.y);

  scene.add(this.object);
};
function difficulty (block) {
  switch(block.name) {
    case 'diamond': return 12;
    case 'gold': return 8;
    case 'rock': return 18;
    case 'clay': return 4;
    case 'dirt': return 2;
    case 'sand': return 1;
    default:
    console.log('unkown type:', block.name);
    return 3;
  }
}

exports.prototype.digInDirection = function (xDir, yDir) {
  var pos = this.object.position;

  if (this._currentDig) {
    if (this._currentDigX === xDir && this._currentDigY === yDir) return;
    // uncomment this line to allow digging to be canceled:
    // this._currentDigCancel();
    return;
  }
  pos.x = this._x;
  pos.y = this._y;
  var block = this._world.getBlock(pos.x + xDir, pos.y + yDir);
  if (block) {
    shake(3);
    var world = this._world;
    var x = this._x + xDir;
    var y = this._y + yDir;
    var self = this;
    var d = difficulty(block);
    var mineTime = d * 80;
    var timers = [];
    soundPlayer.play(d > 5 ? 'DrillMed' : 'DrillFast');
    
    timers.push(setTimeout(function () {
      shake(3);
      block.scale.set(0.5, 0.5, 0.5);
      pos.x += 0.5 * xDir;
      block.position.x = x + 0.25 * xDir;
      block.position.y = y - 0.25;
      if (d > 5) soundPlayer.play('DrillMed');
    }, mineTime / 3));
    timers.push(setTimeout(function () {
      shake(2);
      block.scale.set(0.25, 0.25, 0.25);
      block.position.y = y - 0.25 - 0.125;
      if (d > 5) soundPlayer.play('DrillMed');
    }, mineTime * 2 / 3));
    timers.push(setTimeout(function () {
      shake(0.5);
      pos.x = self._x = x;
      pos.y = self._y = y;
      self._currentDigX = 0;
      self._currentDigY = 0;
      delete self._currentDig;
      if (d > 5) soundPlayer.play('DrillFast');
      // world.setBlock(x - xDir, y - yDir, 'sand');
      world.setBlock(x, y, 'sand');
    }, mineTime));
    this._currentDig = true;

    this._currentDigCancel = function () {
      timers.forEach(clearTimeout);
      self._currentDigX = timers._currentDigY = 0;
      delete self._currentDig;
      pos.x = self._x;
      pos.y = self._y;
      block.scale.set(1,1,1);
      block.position.set(self._x + xDir, self._y + yDir, 0.0);
    };

    // until we have a better digging animation:
    pos.x += 0.4 * xDir;
    pos.y += 0.4 * yDir;

    this._currentDigX = xDir;
    this._currentDigY = yDir;

  } else {
    this._x = pos.x += xDir;
    this._y = pos.y += yDir;
  }

  if(this._y == 10){
    this._world.destroyPalm(this._x-1);
  }
  else if(this._y == 9 && xDir){
    this._world.destroyPalm(this._x);
  }
  else if(this._y == 8 && yDir == 1){
    this._world.destroyPalm(this._x-1);
  }
}

/**
 * Try to dig into a boundary
 * @return undefined
 */
exports.prototype._failAttemptToDig = function (dx, dy) {
  soundPlayer.play('DrillMed');
  if (this._currentDig) this._currentDigCancel();
  this._currentDig = true;
  var self = this;
  var pos = this.object.position;
  var x = pos.x;
  pos.x += dx * 0.5;
  this._currentDigCancel = function () {
    delete self._currentDig;
    pos.x = x;
  };
  setTimeout(this._currentDigCancel, 500);
};

exports.prototype.digLeft = function () {
  if (!this._world.canDig(this._x - 1, this._y)) {
    return this._failAttemptToDig(-1, 0);
  }
  return this.digInDirection(-1, 0);
};

exports.prototype.digRight = function () {
  if (!this._world.canDig(this._x + 1, this._y)) {
    return this._failAttemptToDig(+1, 0);
  }
  return this.digInDirection(+1, 0);
};
exports.prototype.digDown = function () {
  if (!this._world.canDig(this._x, this._y - 1)) {
    return this._failAttemptToDig(0, -1);
  }
  return this.digInDirection(0, -1);
};
exports.prototype.digUp = function() {
  console.log('up?');
  var on = this._world.getBlock(this._x, this._y);
  if (!on) return; // no flying!

  if (!this._world.canDig(this._x, this._y + 1)) {
    return;
  }
  return this.digInDirection(0, +1);
};
exports.prototype.faceLeft = function () {
  this.faceX = -1;
  if (this._currentDigX === +1) {
    // this._currentDigCancel();
  }
};
exports.prototype.faceRight = function () {
  this.faceX = +1;
  if (this._currentDigX === -1) {
    // this._currentDigCancel();
  }
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
