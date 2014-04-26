var exports = module.exports = function (details) {

  var geometry = new THREE.SphereGeometry(0.4,32,32);
  var material = new THREE.MeshBasicMaterial({color: 0x0066CC});
  this.object = new THREE.Mesh(geometry, material);

  // The direction the player is facing:
  this.faceX = +1;
  this.faceY = +1;

  this._world = details.world;

  scene.add(this.object);
};
exports.prototype.digLeft = function () {
  var pos = this.object.position;
  pos.x--;
  var block = this._world.getBlock(pos.x, pos.y);
  this._world.setBlock(pos.x + 1, pos.y, 'sand');
  this._world.setBlock(pos.x, pos.y, null);
};
exports.prototype.digRight = function () {
  var pos = this.object.position;
  pos.x++;
  var block = this._world.getBlock(pos.x, pos.y);
  this._world.setBlock(pos.x - 1, pos.y, 'sand');
  this._world.setBlock(pos.x, pos.y, null);
};
exports.prototype.digDown = function () {
  this.object.position.y++;

};
exports.prototype.digUp = function() {

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
