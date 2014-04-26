var exports = module.exports = function () {

  var geometry = new THREE.CubeGeometry(1,1,1);
  var material = new THREE.MeshBasicMaterial({color: 0x0066CC});
  this.object = new THREE.Mesh(geometry, material);

  // The direction the player is facing:
  this.faceX = +1;
  this.faceY = +1;

  this.object.position.set(0,0,+1);

  scene.add(this.object);
};

exports.prototype.digLeft = function () {
  console.log('digging left...');
  this.object.position.x--;
};
exports.prototype.digRight = function () {
  console.log('digging right...');
  this.object.position.x++;
};
exports.prototype.digDown = function () {
  console.log('dig down');
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
