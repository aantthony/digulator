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

  scene.add(this.object);
};
exports.prototype.digLeft = function () {
  return this.digInDirection(-1, 0);
};

exports.prototype.digInDirection = function (xDir, yDir) {
  var pos = this.object.position;
  if (this._currentDig) {
    if (this._currentDigX === xDir && this._currentDigY === yDir) return;
    this._currentDigX = this._currentDigY = 0;
    clearTimeout(this._currentDig);
    pos.x = Math.round(pos.x);
    pos.y = Math.round(pos.y);
  }
  var block = this._world.getBlock(pos.x + xDir, pos.y + yDir);
  if (block) {
    shake(8);
    var world = this._world;
    var x = pos.x + xDir;
    var y = pos.y + yDir;
    var self = this;
    setTimeout(function () {
      block.scale.set(0.5, 0.5, 0.5);
      block.position.y -= 0.5;
    }, 75);
    setTimeout(function () {
      block.position.y -= 0.2;
      block.scale.set(0.2, 0.2, 0.2);
    }, 150);
    this._currentDig = setTimeout(function () {
      shake(4.5);
      pos.x = x;
      pos.y = y;
      self._currentDigX = 0;
      self._currentDigY = 0;
      delete self._currentDig;
      world.setBlock(x - xDir, y - yDir, 'sand');
      world.setBlock(x, y, null);
    }, 200);

    // until we have a better digging animation:
    pos.x += 0.4 * xDir;
    pos.y += 0.4 * yDir;

    this._currentDigX = xDir;
    this._currentDigY = yDir;

  } else {
    pos.x += xDir;
    pos.y += yDir;
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
