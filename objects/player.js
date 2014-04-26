var soundPlayer = require('./soundPlayer');

var exports = module.exports = function (details) {

  var geometry = new THREE.CubeGeometry(0.4,0.4, 0.4);
  var material = new THREE.MeshBasicMaterial({color: 0x0066CC});
  this.object = new THREE.Mesh(geometry, material);

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
exports.prototype.digLeft = function () {
  return this.digInDirection(-1, 0);
};

function difficulty (block) {
  switch(block.name) {
    case 'diamond': return 24;
    case 'gold': return 12;
    case 'rock': return 8;
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
    this._currentDigCancel();
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

    var mineTime = difficulty(block) * 80;
    var timers = [];
    soundPlayer.play('DrillFast');
    
    timers.push(setTimeout(function () {
      shake(3);
      block.scale.set(0.5, 0.5, 0.5);
      pos.x += 0.5 * xDir;
      block.position.x = x + 0.25 * xDir;
      block.position.y = y - 0.25;
    }, mineTime / 3));
    timers.push(setTimeout(function () {
      shake(2);
      block.scale.set(0.25, 0.25, 0.25);
      block.position.y = y - 0.25 - 0.125;
    }, mineTime * 2 / 3));
    timers.push(setTimeout(function () {
      shake(0.5);
      pos.x = self._x = x;
      pos.y = self._y = y;
      self._currentDigX = 0;
      self._currentDigY = 0;
      delete self._currentDig;
      world.setBlock(x - xDir, y - yDir, 'sand');
      world.setBlock(x, y, null);
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
}
exports.prototype.digRight = function () {
  return this.digInDirection(+1, 0);
};
exports.prototype.digDown = function () {
  return this.digInDirection(0, -1);
};
exports.prototype.digUp = function() {
  return this.digInDirection(0, +1);
};
exports.prototype.faceLeft = function () {
  this.faceX = -1;
  if (this._currentDigX === +1) {
    this._currentDigCancel();
  }
};
exports.prototype.faceRight = function () {
  this.faceX = +1;
  if (this._currentDigX === -1) {
    this._currentDigCancel();
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
